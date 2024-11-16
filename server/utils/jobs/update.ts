import { updateProjectAndStack } from "./update/project-stack";
import dayjs from "dayjs";

import type { Prisma } from "@prisma/client";

export const runUpdate = async (updateId: number) => {
  try {
    const update = await prisma.update.findUnique({
      select: {
        id: true,
        profile: {
          select: {
            id: true,
            regionId: true,
            accountId: true,
            platinum: true,
            gold: true,
            silver: true,
            bronze: true,
            firstTrophyEarnedAt: true,
            lastTrophyEarnedAt: true,
            lastFullUpdateAt: true,
            createdAt: true,
          },
        },
        status: true,
        fullUpdate: true,
        startedProjectsFrom: true,
        completedProjectsFrom: true,
        definedPlatinumFrom: true,
        definedGoldFrom: true,
        definedSilverFrom: true,
        definedBronzeFrom: true,
        earnedPlatinumFrom: true,
        earnedGoldFrom: true,
        earnedSilverFrom: true,
        earnedBronzeFrom: true,
        streamPlatinumFrom: true,
        streamGoldFrom: true,
        streamSilverFrom: true,
        streamBronzeFrom: true,
        hiddenTrophiesFrom: true,
        completionFrom: true,
        pointsFrom: true,
        streamPointsFrom: true,
      },
      where: { id: updateId },
    });

    if (!update || update.status !== "WAITING") return;

    let updateSuccessful = true;
    let progress = 0;

    await prisma.update.update({
      where: { id: update.id },
      data: {
        status: "RUNNING",
        startedAt: dayjs().format(),
      },
    });

    const profileSummary = {
      firstTrophyEarnedAt: update.profile.firstTrophyEarnedAt,
      lastTrophyEarnedAt: update.profile.lastTrophyEarnedAt,
      startedProjects: update.fullUpdate ? 0 : update.startedProjectsFrom,
      completedProjects: update.fullUpdate ? 0 : update.completedProjectsFrom,
      definedPlatinum: update.fullUpdate ? 0 : update.definedPlatinumFrom,
      definedGold: update.fullUpdate ? 0 : update.definedGoldFrom,
      definedSilver: update.fullUpdate ? 0 : update.definedSilverFrom,
      definedBronze: update.fullUpdate ? 0 : update.definedBronzeFrom,
      earnedPlatinum: update.fullUpdate ? 0 : update.earnedPlatinumFrom,
      earnedGold: update.fullUpdate ? 0 : update.earnedGoldFrom,
      earnedSilver: update.fullUpdate ? 0 : update.earnedSilverFrom,
      earnedBronze: update.fullUpdate ? 0 : update.earnedBronzeFrom,
      streamPlatinum: update.fullUpdate ? 0 : update.streamPlatinumFrom,
      streamGold: update.fullUpdate ? 0 : update.streamGoldFrom,
      streamSilver: update.fullUpdate ? 0 : update.streamSilverFrom,
      streamBronze: update.fullUpdate ? 0 : update.streamBronzeFrom,
      hiddenTrophies: update.fullUpdate ? 0 : update.hiddenTrophiesFrom,
      completion: update.fullUpdate
        ? (0 as unknown as Prisma.Decimal)
        : update.completionFrom,
      points: update.fullUpdate ? 0 : update.pointsFrom,
      streamPoints: update.fullUpdate
        ? (0 as unknown as Prisma.Decimal)
        : update.streamPointsFrom,
    };

    const getProjects = async () => {
      let projects: {
        npServiceName: string;
        npCommunicationId: string;
        trophyTitleName: string;
        trophyTitleIconUrl: string;
        trophyTitlePlatform: string;
        definedTrophies: {
          bronze: number;
          silver: number;
          gold: number;
          platinum: number;
        };
        progress: number;
        earnedTrophies: {
          bronze: number;
          silver: number;
          gold: number;
          platinum: number;
        };
      }[] = [];

      const projectsFromPsn = await psn.projects({
        accountId: update.profile.accountId,
        limit: 100,
        offset: 0,
      });

      if (!projectsFromPsn.data) {
        updateSuccessful = false;
        return projects;
      }

      projects = projects.concat(projectsFromPsn.data.trophyTitles);

      if (update.fullUpdate) {
        const projectsLeft = projectsFromPsn.data.totalItemCount - 100;

        if (projectsLeft > 0) {
          const callsToDo = Math.ceil(projectsLeft / 100);

          let offset = 100;

          for (let c = 0, ctd = callsToDo; c < ctd; c++) {
            const moreProjectsFromPsn = await psn.projects({
              accountId: update.profile.accountId,
              limit: 100,
              offset,
            });

            if (!moreProjectsFromPsn.data) {
              updateSuccessful = false;
              break;
            } else {
              projects = projects.concat(moreProjectsFromPsn.data.trophyTitles);
              offset += 100;
            }
          }
        }
      }

      return projects.reverse();
    };

    const [projects, profilesCount] = await Promise.all([
      getProjects(),
      prisma.profile.count(),
    ]);

    if (!updateSuccessful || !projects.length) {
      await prisma.update.update({
        where: { id: update.id },
        data: {
          status: "FAILED",
          finishedAt: dayjs().format(),
        },
      });

      return;
    }

    if (update.fullUpdate) {
      for (let p = 0, pl = projects.length; p < pl; p++) {
        const project = projects[p];

        if (project.progress) {
          profileSummary.startedProjects += 1;

          if (project.progress === 100) {
            profileSummary.completedProjects += 1;
          }

          profileSummary.definedPlatinum += project.definedTrophies.platinum;
          profileSummary.definedGold += project.definedTrophies.gold;
          profileSummary.definedSilver += project.definedTrophies.silver;
          profileSummary.definedBronze += project.definedTrophies.bronze;

          profileSummary.earnedPlatinum += project.earnedTrophies.platinum;
          profileSummary.earnedGold += project.earnedTrophies.gold;
          profileSummary.earnedSilver += project.earnedTrophies.silver;
          profileSummary.earnedBronze += project.earnedTrophies.bronze;
        }
      }

      calculateCompletion();
    }

    for (let p = 0, pl = projects.length; p < pl; p++) {
      const project = projects[p];

      if (project.progress) {
        const updatedProject = await updateProjectAndStack({
          updateId: update.id,
          profilesCount,
          profile: {
            id: update.profile.id,
            accountId: update.profile.accountId,
            completion: Math.floor(Number(profileSummary.completion)),
            createdAt: update.profile.createdAt,
          },
          project,
        });

        if (!updatedProject.data) {
          updateSuccessful = false;
          break;
        }

        if (updatedProject.data.project.firstTrophyEarnedAt) {
          if (
            !profileSummary.firstTrophyEarnedAt ||
            dayjs(updatedProject.data.project.firstTrophyEarnedAt).isBefore(
              profileSummary.firstTrophyEarnedAt,
            )
          ) {
            profileSummary.firstTrophyEarnedAt = dayjs(
              updatedProject.data.project.firstTrophyEarnedAt,
            ).format() as unknown as Date;
          }
        }

        if (updatedProject.data.project.lastTrophyEarnedAt) {
          if (
            !profileSummary.lastTrophyEarnedAt ||
            dayjs(updatedProject.data.project.lastTrophyEarnedAt).isAfter(
              profileSummary.lastTrophyEarnedAt,
            )
          ) {
            profileSummary.lastTrophyEarnedAt = dayjs(
              updatedProject.data.project.lastTrophyEarnedAt,
            ).format() as unknown as Date;
          }
        }

        if (!update.fullUpdate) {
          const changes = updatedProject.data.changes;

          if (changes.new) {
            profileSummary.startedProjects += 1;
            profileSummary.definedPlatinum += changes.trophies.defined.platinum;
            profileSummary.definedGold += changes.trophies.defined.gold;
            profileSummary.definedSilver += changes.trophies.defined.silver;
            profileSummary.definedBronze += changes.trophies.defined.bronze;
          }

          if (changes.progress.old === 100 && changes.progress.new !== 100) {
            profileSummary.completedProjects -= 1;
          }

          if (changes.progress.old !== 100 && changes.progress.new === 100) {
            profileSummary.completedProjects += 1;
          }

          profileSummary.earnedPlatinum += changes.trophies.earned.platinum;
          profileSummary.earnedGold += changes.trophies.earned.gold;
          profileSummary.earnedSilver += changes.trophies.earned.silver;
          profileSummary.earnedBronze += changes.trophies.earned.bronze;

          if (updatedProject.data.newStreamTrophies) {
            profileSummary.streamPlatinum +=
              updatedProject.data.newStreamTrophies.platinum;
            profileSummary.streamGold +=
              updatedProject.data.newStreamTrophies.gold;
            profileSummary.streamSilver +=
              updatedProject.data.newStreamTrophies.silver;
            profileSummary.streamBronze +=
              updatedProject.data.newStreamTrophies.bronze;
          }

          profileSummary.points = (Math.round(
            (Number(profileSummary.points) +
              Number(changes.points) +
              Number.EPSILON) *
              100,
          ) / 100) as unknown as Prisma.Decimal;

          profileSummary.streamPoints = (Math.round(
            (Number(profileSummary.streamPoints) +
              Number(changes.streamPoints) +
              Number.EPSILON) *
              100,
          ) / 100) as unknown as Prisma.Decimal;
        } else {
          profileSummary.streamPlatinum +=
            updatedProject.data.project.streamPlatinum;
          profileSummary.streamGold += updatedProject.data.project.streamGold;
          profileSummary.streamSilver +=
            updatedProject.data.project.streamSilver;
          profileSummary.streamBronze +=
            updatedProject.data.project.streamBronze;

          profileSummary.points = (Math.round(
            (Number(profileSummary.points) +
              Number(updatedProject.data.project.points) +
              Number.EPSILON) *
              100,
          ) / 100) as unknown as Prisma.Decimal;

          profileSummary.streamPoints = (Math.round(
            (Number(profileSummary.streamPoints) +
              Number(updatedProject.data.project.streamPoints) +
              Number.EPSILON) *
              100,
          ) / 100) as unknown as Prisma.Decimal;
        }

        if (updatedProject.data.streamId) {
          const stream = await prisma.stream.findUnique({
            select: {
              id: true,
              platinum: true,
              gold: true,
              silver: true,
              bronze: true,
            },
            where: { id: updatedProject.data.streamId },
          });

          if (stream) {
            await prisma.stream.update({
              where: { id: stream.id },
              data: {
                platinum:
                  stream.platinum +
                  updatedProject.data.newStreamTrophies.platinum,
                gold: stream.gold + updatedProject.data.newStreamTrophies.gold,
                silver:
                  stream.silver + updatedProject.data.newStreamTrophies.silver,
                bronze:
                  stream.bronze + updatedProject.data.newStreamTrophies.bronze,
              },
            });
          }
        }
      }

      const newProgress = Math.floor((100 * (p + 1)) / pl);

      if (newProgress > progress) {
        await prisma.update.update({
          where: { id: update.id },
          data: { progress: newProgress },
        });

        progress = newProgress;
      }
    }

    if (!updateSuccessful) {
      await prisma.update.update({
        where: { id: update.id },
        data: {
          status: "FAILED",
          finishedAt: dayjs().format(),
        },
      });

      return;
    }

    await prisma.profile.update({
      where: { id: update.profile.id },
      data: {
        firstTrophyEarnedAt: profileSummary.firstTrophyEarnedAt,
        lastTrophyEarnedAt: profileSummary.lastTrophyEarnedAt,
        startedProjects: profileSummary.startedProjects,
        completedProjects: profileSummary.completedProjects,
        definedPlatinum: profileSummary.definedPlatinum,
        definedGold: profileSummary.definedGold,
        definedSilver: profileSummary.definedSilver,
        definedBronze: profileSummary.definedBronze,
        earnedPlatinum: profileSummary.earnedPlatinum,
        earnedGold: profileSummary.earnedGold,
        earnedSilver: profileSummary.earnedSilver,
        earnedBronze: profileSummary.earnedBronze,
        streamPlatinum: profileSummary.streamPlatinum,
        streamGold: profileSummary.streamGold,
        streamSilver: profileSummary.streamSilver,
        streamBronze: profileSummary.streamBronze,
        hiddenTrophies: profileSummary.hiddenTrophies,
        completion: profileSummary.completion,
        points: profileSummary.points,
        streamPoints: profileSummary.streamPoints,
        lastFullUpdateAt: update.fullUpdate
          ? dayjs().format()
          : update.profile.lastFullUpdateAt,
      },
    });

    const profileRegion = await prisma.profileRegion.findUnique({
      select: {
        id: true,
        rankedProfiles: true,
        earnedPlatinum: true,
        earnedGold: true,
        earnedSilver: true,
        earnedBronze: true,
        completion: true,
        points: true,
        profiles: {
          select: {
            id: true,
            earnedPlatinum: true,
            earnedGold: true,
            earnedSilver: true,
            earnedBronze: true,
            hiddenTrophies: true,
            completion: true,
            points: true,
            regionalPosition: true,
          },
          where: {
            lastFullUpdateAt: { not: null },
          },
          orderBy: {
            points: "desc",
          },
        },
      },
      where: { id: update.profile.regionId },
    });

    const profileRegionData = {
      rankedProfiles: 0,
      earnedPlatinum: 0,
      earnedGold: 0,
      earnedSilver: 0,
      earnedBronze: 0,
      completion: 0 as unknown as Prisma.Decimal,
      points: 0 as unknown as Prisma.Decimal,
    };

    if (profileRegion) {
      let regionalPosition = 1;

      for (
        let prp = 0, prpl = profileRegion.profiles.length;
        prp < prpl;
        prp++
      ) {
        const profile = profileRegion.profiles[prp];

        if (!profile.hiddenTrophies) {
          profileRegionData.rankedProfiles += 1;
          profileRegionData.earnedPlatinum += profile.earnedPlatinum;
          profileRegionData.earnedGold += profile.earnedGold;
          profileRegionData.earnedSilver += profile.earnedSilver;
          profileRegionData.earnedBronze += profile.earnedBronze;
          profileRegionData.completion = (Math.round(
            (Number(profileRegionData.completion) +
              Number(profile.completion) +
              Number.EPSILON) *
              100,
          ) / 100) as unknown as Prisma.Decimal;
          profileRegionData.points = (Math.round(
            (Number(profileRegionData.points) +
              Number(profile.points) +
              Number.EPSILON) *
              100,
          ) / 100) as unknown as Prisma.Decimal;

          if (profile.regionalPosition !== regionalPosition) {
            await prisma.profile.update({
              where: { id: profile.id },
              data: {
                regionalPosition: regionalPosition,
                regionalPostionChanges: {
                  create: {
                    regionalPositionFrom: profile.regionalPosition,
                    regionalPositionTo: regionalPosition,
                  },
                },
              },
            });
          }

          regionalPosition += 1;
        } else {
          if (profile.regionalPosition) {
            await prisma.profile.update({
              where: { id: profile.id },
              data: {
                regionalPosition: 0,
                regionalPostionChanges: {
                  create: {
                    regionalPositionFrom: profile.regionalPosition,
                    regionalPositionTo: 0,
                  },
                },
              },
            });
          }
        }
      }

      profileRegionData.completion = (Math.round(
        (Number(profileRegionData.completion) /
          profileRegionData.rankedProfiles +
          Number.EPSILON) *
          100,
      ) / 100) as unknown as Prisma.Decimal;

      await prisma.profileRegion.update({
        where: { id: profileRegion.id },
        data: {
          rankedProfiles: profileRegionData.rankedProfiles,
          earnedPlatinum: profileRegionData.earnedPlatinum,
          earnedGold: profileRegionData.earnedGold,
          earnedSilver: profileRegionData.earnedSilver,
          earnedBronze: profileRegionData.earnedBronze,
          completion: profileRegionData.completion,
          points: profileRegionData.points,
          changes: {
            create: {
              rankedProfilesFrom: profileRegion.rankedProfiles,
              rankedProfilesTo: profileRegionData.rankedProfiles,
              earnedPlatinumFrom: profileRegion.earnedPlatinum,
              earnedPlatinumTo: profileRegionData.earnedPlatinum,
              earnedGoldFrom: profileRegion.earnedGold,
              earnedGoldTo: profileRegionData.earnedGold,
              earnedSilverFrom: profileRegion.earnedSilver,
              earnedSilverTo: profileRegionData.earnedSilver,
              earnedBronzeFrom: profileRegion.earnedBronze,
              earnedBronzeTo: profileRegionData.earnedBronze,
              completionFrom: profileRegion.completion,
              completionTo: profileRegionData.completion,
              pointsFrom: profileRegion.points,
              pointsTo: profileRegionData.points,
            },
          },
        },
      });
    }

    await prisma.update.update({
      where: { id: update.id },
      data: {
        status: "SUCCESSFUL",
        finishedAt: dayjs().format(),
        startedProjectsTo: profileSummary.startedProjects,
        completedProjectsTo: profileSummary.completedProjects,
        definedPlatinumTo: profileSummary.definedPlatinum,
        definedGoldTo: profileSummary.definedGold,
        definedSilverTo: profileSummary.definedSilver,
        definedBronzeTo: profileSummary.definedBronze,
        earnedPlatinumTo: profileSummary.earnedPlatinum,
        earnedGoldTo: profileSummary.earnedGold,
        earnedSilverTo: profileSummary.earnedSilver,
        earnedBronzeTo: profileSummary.earnedBronze,
        streamPlatinumTo: profileSummary.streamPlatinum,
        streamGoldTo: profileSummary.streamGold,
        streamSilverTo: profileSummary.streamSilver,
        streamBronzeTo: profileSummary.streamBronze,
        hiddenTrophiesTo: profileSummary.hiddenTrophies,
        completionTo: profileSummary.completion,
        pointsTo: profileSummary.points,
        streamPointsTo: profileSummary.streamPoints,
      },
    });

    const otherUpdates = await prisma.update.count({
      where: {
        OR: [{ status: "WAITING" }, { status: "RUNNING" }],
      },
    });

    if (!otherUpdates) {
      await addJob({ type: "RANK" });
    }

    return;

    function calculateCompletion() {
      if (update) {
        let hiddenPlatinum = Math.round(
          profileSummary.earnedPlatinum - update.profile.platinum,
        );
        let hiddenGold = Math.round(
          profileSummary.earnedGold - update.profile.gold,
        );
        let hiddenSilver = Math.round(
          profileSummary.earnedSilver - update.profile.silver,
        );
        let hiddenBronze = Math.round(
          profileSummary.earnedBronze - update.profile.bronze,
        );

        if (hiddenPlatinum < 0) {
          hiddenPlatinum = 0;
        }

        if (hiddenGold < 0) {
          hiddenGold = 0;
        }

        if (hiddenSilver < 0) {
          hiddenSilver = 0;
        }

        if (hiddenBronze < 0) {
          hiddenBronze = 0;
        }

        profileSummary.hiddenTrophies = Math.round(
          hiddenPlatinum + hiddenGold + hiddenSilver + hiddenBronze,
        );

        const definedGoldPoints = Math.round(profileSummary.definedGold * 90);
        const definedSilverPoints = Math.round(
          profileSummary.definedSilver * 30,
        );
        const definedBronzePoints = Math.round(
          profileSummary.definedBronze * 15,
        );

        const earnedGoldPoints = Math.round(profileSummary.earnedGold * 90);
        const earnedSilverPoints = Math.round(profileSummary.earnedSilver * 30);
        const earnedBronzePoints = Math.round(profileSummary.earnedBronze * 15);

        const definedPoints = Math.round(
          definedGoldPoints + definedSilverPoints + definedBronzePoints,
        );

        const earnedPoints = Math.round(
          earnedGoldPoints + earnedSilverPoints + earnedBronzePoints,
        );

        profileSummary.completion = (Math.round(
          ((100 * earnedPoints) / definedPoints + Number.EPSILON) * 100,
        ) / 100) as unknown as Prisma.Decimal;
      }
    }
  } catch (e) {
    console.error(e);

    await prisma.update.update({
      where: { id: updateId },
      data: {
        status: "FAILED",
        finishedAt: dayjs().format(),
      },
    });

    return;
  }
};
