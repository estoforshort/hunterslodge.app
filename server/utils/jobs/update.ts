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
            accountId: true,
            platinum: true,
            gold: true,
            silver: true,
            bronze: true,
            summary: {
              select: {
                firstTrophyEarnedAt: true,
                lastTrophyEarnedAt: true,
                lastFullUpdateAt: true,
              },
            },
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
        hiddenTrophiesFrom: true,
        completionFrom: true,
      },
      where: { id: updateId },
    });

    if (!update || update.status !== "WAITING") return;

    let updateSuccessful = true;
    let progress = 0;

    await prisma.update.update({
      data: {
        status: "RUNNING",
        startedAt: dayjs().format(),
      },
      where: { id: update.id },
    });

    const profileSummary = {
      firstTrophyEarnedAt: update.profile.summary!.firstTrophyEarnedAt,
      lastTrophyEarnedAt: update.profile.summary!.lastTrophyEarnedAt,
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
      hiddenTrophies: update.fullUpdate ? 0 : update.hiddenTrophiesFrom,
      completion: update.fullUpdate
        ? (0 as unknown as Prisma.Decimal)
        : update.completionFrom,
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

      const projectsFromPsn = await psnApiFetchProjects({
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
            const moreProjectsFromPsn = await psnApiFetchProjects({
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

    const projects = await getProjects();

    if (!updateSuccessful || !projects.length) {
      await prisma.update.update({
        data: {
          status: "FAILED",
          finishedAt: dayjs().format(),
        },
        where: { id: update.id },
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
          profile: {
            id: update.profile.id,
            accountId: update.profile.accountId,
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
        }
      }

      const newProgress = Math.floor((100 * (p + 1)) / pl);

      if (newProgress > progress) {
        await prisma.update.update({
          data: { progress: newProgress },
          where: { id: update.id },
        });

        progress = newProgress;
      }
    }

    if (!updateSuccessful) {
      await prisma.update.update({
        data: {
          status: "FAILED",
          finishedAt: dayjs().format(),
        },
        where: { id: update.id },
      });

      return;
    }

    if (!update.fullUpdate) {
      calculateCompletion();
    }

    await prisma.profileSummary.update({
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
        hiddenTrophies: profileSummary.hiddenTrophies,
        completion: profileSummary.completion,
        lastFullUpdateAt: update.fullUpdate
          ? dayjs().format()
          : update.profile.summary!.lastFullUpdateAt,
      },
      where: { profileId: update.profile.id },
    });

    await prisma.update.update({
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
        hiddenTrophiesTo: profileSummary.hiddenTrophies,
        completionTo: profileSummary.completion,
      },
      where: { id: update.id },
    });

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
      data: {
        status: "FAILED",
        finishedAt: dayjs().format(),
      },
      where: { id: updateId },
    });

    return;
  }
};
