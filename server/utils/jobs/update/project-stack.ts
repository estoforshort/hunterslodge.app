import { updateProjectAndStackGroup } from "./project-stack/group";
import { createHash } from "node:crypto";
import { updateGame } from "./game";
import dayjs from "dayjs";

type Data = {
  updateId: number;
  profile: {
    id: number;
    accountId: string;
    createdAt: Date;
  };
  project: {
    npServiceName: string;
    npCommunicationId: string;
    trophyTitleName: string;
    trophyTitleIconUrl: string;
    trophyTitlePlatform: string;
    hasTrophyGroups: boolean;
    trophyGroupCount: number;
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
  };
};

export const updateProjectAndStack = async (data: Data) => {
  try {
    let updateSuccessful = true;

    const [findProjectWithStack, profilesCount] = await Promise.all([
      prisma.project.findUnique({
        where: {
          profileId_stackId: {
            profileId: data.profile.id,
            stackId: data.project.npCommunicationId,
          },
        },
        include: { stack: true },
      }),
      prisma.profile.count(),
    ]);

    const newStreamTrophies = {
      platinum: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
    };

    let streamId = null as string | null;

    if (
      !findProjectWithStack ||
      findProjectWithStack.stack.profilesCount !== profilesCount ||
      findProjectWithStack.earnedPlatinum !==
        data.project.earnedTrophies.platinum ||
      findProjectWithStack.earnedGold !== data.project.earnedTrophies.gold ||
      findProjectWithStack.earnedSilver !==
        data.project.earnedTrophies.silver ||
      findProjectWithStack.earnedBronze !==
        data.project.earnedTrophies.bronze ||
      findProjectWithStack.progress !== data.project.progress ||
      Number(findProjectWithStack.value) !==
        Number(findProjectWithStack.stack.value) ||
      findProjectWithStack.stack.definedPlatinum !==
        data.project.definedTrophies.platinum ||
      findProjectWithStack.stack.definedGold !==
        data.project.definedTrophies.gold ||
      findProjectWithStack.stack.definedSilver !==
        data.project.definedTrophies.silver ||
      findProjectWithStack.stack.definedBronze !==
        data.project.definedTrophies.bronze
    ) {
      const projectGroups: {
        trophyGroupId: string;
        progress: number;
        earnedTrophies: {
          bronze: number;
          silver: number;
          gold: number;
          platinum: number;
        };
      }[] = [];

      if (
        !findProjectWithStack ||
        findProjectWithStack.earnedPlatinum !==
          data.project.earnedTrophies.platinum ||
        findProjectWithStack.earnedGold !== data.project.earnedTrophies.gold ||
        findProjectWithStack.earnedSilver !==
          data.project.earnedTrophies.silver ||
        findProjectWithStack.earnedBronze !==
          data.project.earnedTrophies.bronze ||
        findProjectWithStack.progress !== data.project.progress ||
        findProjectWithStack.stack.definedPlatinum !==
          data.project.definedTrophies.platinum ||
        findProjectWithStack.stack.definedGold !==
          data.project.definedTrophies.gold ||
        findProjectWithStack.stack.definedSilver !==
          data.project.definedTrophies.silver ||
        findProjectWithStack.stack.definedBronze !==
          data.project.definedTrophies.bronze
      ) {
        const getGroupsFromPsn = await psn.projectGroups({
          accountId: data.profile.accountId,
          npCommunicationId: data.project.npCommunicationId,
          npServiceName: data.project.npServiceName,
        });

        if (!getGroupsFromPsn.data) {
          return {
            data: null,
          };
        }

        for (
          let g = 0, gl = getGroupsFromPsn.data.trophyGroups.length;
          g < gl;
          g++
        ) {
          const group = getGroupsFromPsn.data.trophyGroups[g];

          projectGroups.push({
            trophyGroupId: group.trophyGroupId,
            progress: group.progress,
            earnedTrophies: {
              platinum: group.earnedTrophies.platinum,
              gold: group.earnedTrophies.gold,
              silver: group.earnedTrophies.silver,
              bronze: group.earnedTrophies.bronze,
            },
          });
        }
      } else {
        const getGroupsFromDatabase = await prisma.projectGroup.findMany({
          select: {
            groupId: true,
            progress: true,
            earnedPlatinum: true,
            earnedGold: true,
            earnedSilver: true,
            earnedBronze: true,
          },
          where: {
            profileId: data.profile.id,
            stackId: data.project.npCommunicationId,
          },
          orderBy: { groupId: "asc" },
        });

        for (let g = 0, gl = getGroupsFromDatabase.length; g < gl; g++) {
          const group = getGroupsFromDatabase[g];

          projectGroups.push({
            trophyGroupId: group.groupId,
            progress: group.progress,
            earnedTrophies: {
              platinum: group.earnedPlatinum,
              gold: group.earnedGold,
              silver: group.earnedSilver,
              bronze: group.earnedBronze,
            },
          });
        }
      }

      const getStack = async () => {
        const findStack = await prisma.stack.findUnique({
          where: { id: data.project.npCommunicationId },
          include: { game: true },
        });

        const name = data.project.trophyTitleName.replace(/\s+/g, " ").trim();
        const hash = createHash("md5")
          .update(
            `${data.project.npServiceName}-${name}-${data.project.trophyTitlePlatform}-${data.project.definedTrophies.platinum}-${data.project.definedTrophies.gold}-${data.project.definedTrophies.silver}-${data.project.definedTrophies.gold}-${data.project.hasTrophyGroups}-${data.project.trophyGroupCount}`,
          )
          .digest("hex");

        if (findStack) {
          if (findStack.game.hash !== hash) {
            await updateGame({
              gameId: findStack.gameId,
              hash,
              stackId: data.project.npCommunicationId,
              service: data.project.npServiceName,
              name,
              imageUrl: data.project.trophyTitleIconUrl,
              platform: data.project.trophyTitlePlatform,
              definedPlatinum: data.project.definedTrophies.platinum,
              definedGold: data.project.definedTrophies.gold,
              definedSilver: data.project.definedTrophies.silver,
              definedBronze: data.project.definedTrophies.bronze,
            });
          }

          return findStack;
        }

        const game = await updateGame({
          gameId: null,
          hash,
          stackId: data.project.npCommunicationId,
          service: data.project.npServiceName,
          name,
          imageUrl: data.project.trophyTitleIconUrl,
          platform: data.project.trophyTitlePlatform,
          definedPlatinum: data.project.definedTrophies.platinum,
          definedGold: data.project.definedTrophies.gold,
          definedSilver: data.project.definedTrophies.silver,
          definedBronze: data.project.definedTrophies.bronze,
        });

        if (!game.data) {
          return null;
        }

        return await prisma.stack.create({
          data: {
            id: data.project.npCommunicationId,
            gameId: game.data.id,
          },
        });
      };

      const stack = await getStack();

      if (!stack) {
        return {
          data: null,
        };
      }

      let newProject = false;

      const getProject = async () => {
        const findProject = await prisma.project.findUnique({
          where: {
            profileId_stackId: {
              profileId: data.profile.id,
              stackId: stack.id,
            },
          },
        });

        if (findProject) return findProject;

        newProject = true;

        return await prisma.project.create({
          data: {
            profileId: data.profile.id,
            stackId: stack.id,
          },
        });
      };

      const project = await getProject();

      const [timesStarted, totalTimesStarted] = await Promise.all([
        prisma.project.count({
          where: { stackId: stack.id },
        }),
        prisma.project.count({
          where: { stack: { gameId: stack.gameId } },
        }),
      ]);

      const projectData = {
        earnedPlatinum: data.project.earnedTrophies.platinum,
        earnedGold: data.project.earnedTrophies.gold,
        earnedSilver: data.project.earnedTrophies.silver,
        earnedBronze: data.project.earnedTrophies.bronze,
        streamPlatinum: 0,
        streamGold: 0,
        streamSilver: 0,
        streamBronze: 0,
        firstTrophyEarnedAt: project.firstTrophyEarnedAt,
        lastTrophyEarnedAt: project.lastTrophyEarnedAt,
        progress: data.project.progress,
        value: 0,
        points: 0,
        streamPoints: 0,
      };

      const stackData = {
        definedPlatinum: data.project.definedTrophies.platinum,
        definedGold: data.project.definedTrophies.gold,
        definedSilver: data.project.definedTrophies.silver,
        definedBronze: data.project.definedTrophies.bronze,
        firstTrophyEarnedAt: stack.firstTrophyEarnedAt,
        lastTrophyEarnedAt: stack.lastTrophyEarnedAt,
        quality: 0,
        profilesCount: profilesCount,
        timesStarted: timesStarted,
        timesCompleted: 0,
        avgProgress: 0,
        value: 0,
      };

      const getProjectChange = async () => {
        const findProjectChange = await prisma.projectChange.findUnique({
          where: {
            updateId_stackId: {
              updateId: data.updateId,
              stackId: project.stackId,
            },
          },
        });

        if (findProjectChange) {
          return await prisma.projectChange.update({
            data: {
              earnedPlatinumFrom: project.earnedPlatinum,
              earnedGoldFrom: project.earnedGold,
              earnedSilverFrom: project.earnedSilver,
              earnedBronzeFrom: project.earnedBronze,
              streamPlatinumFrom: project.streamPlatinum,
              streamGoldFrom: project.streamGold,
              streamSilverFrom: project.streamSilver,
              streamBronzeFrom: project.streamBronze,
              progressFrom: project.progress,
              pointsFrom: project.points,
              streamPointsFrom: project.streamPoints,
            },
            where: {
              updateId_stackId: {
                updateId: findProjectChange.updateId,
                stackId: findProjectChange.stackId,
              },
            },
          });
        }

        return await prisma.projectChange.create({
          data: {
            updateId: data.updateId,
            profileId: project.profileId,
            stackId: project.stackId,
            earnedPlatinumFrom: project.earnedPlatinum,
            earnedGoldFrom: project.earnedGold,
            earnedSilverFrom: project.earnedSilver,
            earnedBronzeFrom: project.earnedBronze,
            streamPlatinumFrom: project.streamPlatinum,
            streamGoldFrom: project.streamGold,
            streamSilverFrom: project.streamSilver,
            streamBronzeFrom: project.streamBronze,
            progressFrom: project.progress,
            pointsFrom: project.points,
            streamPointsFrom: project.streamPoints,
          },
        });
      };

      const [createProjectChange, createStackChange] = await Promise.all([
        getProjectChange(),
        prisma.stackChange.create({
          data: {
            stackId: stack.id,
            definedPlatinumFrom: stack.definedPlatinum,
            definedGoldFrom: stack.definedGold,
            definedSilverFrom: stack.definedSilver,
            definedBronzeFrom: stack.definedBronze,
            qualityFrom: stack.quality,
            timesStartedFrom: stack.timesStarted,
            timesCompletedFrom: stack.timesCompleted,
            avgProgressFrom: stack.avgProgress,
            valueFrom: stack.value,
          },
        }),
      ]);

      const groupsToUpdate = [];

      for (let pg = 0, pgl = projectGroups.length; pg < pgl; pg++) {
        const group = projectGroups[pg];

        groupsToUpdate.push(
          updateProjectAndStackGroup({
            updateId: data.updateId,
            stackChangeId: createStackChange.id,
            profilesCount: profilesCount,
            profile: data.profile,
            game: {
              id: stack.gameId,
              service: data.project.npServiceName,
            },
            stack: {
              id: stack.id,
              totalTimesStarted,
            },
            group,
          }).then((updatedGroup) => {
            if (!updatedGroup.data) {
              updateSuccessful = false;
            } else {
              if (updatedGroup.data.projectGroup.firstTrophyEarnedAt) {
                if (
                  !projectData.firstTrophyEarnedAt ||
                  dayjs(
                    updatedGroup.data.projectGroup.firstTrophyEarnedAt,
                  ).isBefore(projectData.firstTrophyEarnedAt)
                ) {
                  projectData.firstTrophyEarnedAt = dayjs(
                    updatedGroup.data.projectGroup.firstTrophyEarnedAt,
                  ).format() as unknown as Date;
                }
              }

              if (updatedGroup.data.projectGroup.lastTrophyEarnedAt) {
                if (
                  !projectData.lastTrophyEarnedAt ||
                  dayjs(
                    updatedGroup.data.projectGroup.lastTrophyEarnedAt,
                  ).isAfter(projectData.lastTrophyEarnedAt)
                ) {
                  projectData.lastTrophyEarnedAt = dayjs(
                    updatedGroup.data.projectGroup.lastTrophyEarnedAt,
                  ).format() as unknown as Date;
                }
              }

              projectData.streamPlatinum +=
                updatedGroup.data.projectGroup.streamPlatinum;
              projectData.streamGold +=
                updatedGroup.data.projectGroup.streamGold;
              projectData.streamSilver +=
                updatedGroup.data.projectGroup.streamSilver;
              projectData.streamBronze +=
                updatedGroup.data.projectGroup.streamBronze;

              if (updatedGroup.data.newStreamTrophies) {
                newStreamTrophies.platinum +=
                  updatedGroup.data.newStreamTrophies.platinum;
                newStreamTrophies.gold +=
                  updatedGroup.data.newStreamTrophies.gold;
                newStreamTrophies.silver +=
                  updatedGroup.data.newStreamTrophies.silver;
                newStreamTrophies.bronze +=
                  updatedGroup.data.newStreamTrophies.bronze;
              }

              if (updatedGroup.data.streamId && !streamId) {
                streamId = updatedGroup.data.streamId;
              }

              projectData.value += Number(updatedGroup.data.stackGroup.value);
              projectData.points += Number(
                updatedGroup.data.projectGroup.points,
              );
              projectData.streamPoints += Number(
                updatedGroup.data.projectGroup.streamPoints,
              );

              if (updatedGroup.data.stackGroup.firstTrophyEarnedAt) {
                if (
                  !stackData.firstTrophyEarnedAt ||
                  dayjs(
                    updatedGroup.data.stackGroup.firstTrophyEarnedAt,
                  ).isBefore(stackData.firstTrophyEarnedAt)
                ) {
                  stackData.firstTrophyEarnedAt = dayjs(
                    updatedGroup.data.stackGroup.firstTrophyEarnedAt,
                  ).format() as unknown as Date;
                }
              }

              if (updatedGroup.data.stackGroup.lastTrophyEarnedAt) {
                if (
                  !stackData.lastTrophyEarnedAt ||
                  dayjs(
                    updatedGroup.data.stackGroup.lastTrophyEarnedAt,
                  ).isAfter(stackData.lastTrophyEarnedAt)
                ) {
                  stackData.lastTrophyEarnedAt = dayjs(
                    updatedGroup.data.stackGroup.lastTrophyEarnedAt,
                  ).format() as unknown as Date;
                }
              }

              stackData.value += Number(updatedGroup.data.stackGroup.value);
            }
          }),
        );
      }

      await Promise.all(groupsToUpdate);

      if (!updateSuccessful) {
        await Promise.all([
          await prisma.projectChange.delete({
            where: {
              updateId_stackId: {
                updateId: createProjectChange.updateId,
                stackId: createProjectChange.stackId,
              },
            },
          }),
          await prisma.stackChange.delete({
            where: {
              id: createStackChange.id,
            },
          }),
        ]);

        return {
          data: null,
        };
      }

      projectData.value =
        Math.round((projectData.value + Number.EPSILON) * 100) / 100;
      projectData.points =
        Math.round((projectData.points + Number.EPSILON) * 100) / 100;
      projectData.streamPoints =
        Math.round((projectData.streamPoints + Number.EPSILON) * 100) / 100;
      stackData.value =
        Math.round((stackData.value + Number.EPSILON) * 100) / 100;

      const updateProject = await prisma.project.update({
        where: {
          profileId_stackId: {
            profileId: data.profile.id,
            stackId: stack.id,
          },
        },
        data: projectData,
      });

      await prisma.projectChange.update({
        where: {
          updateId_stackId: {
            updateId: createProjectChange.updateId,
            stackId: createProjectChange.stackId,
          },
        },
        data: {
          earnedPlatinumTo: updateProject.earnedPlatinum,
          earnedGoldTo: updateProject.earnedGold,
          earnedSilverTo: updateProject.earnedSilver,
          earnedBronzeTo: updateProject.earnedBronze,
          streamPlatinumTo: updateProject.streamPlatinum,
          streamGoldTo: updateProject.streamGold,
          streamSilverTo: updateProject.streamSilver,
          streamBronzeTo: updateProject.streamBronze,
          progressTo: updateProject.progress,
          pointsTo: updateProject.points,
          streamPointsTo: updateProject.streamPoints,
        },
      });

      const [avgQuality, timesCompleted, avgProgress] = await Promise.all([
        prisma.stackTrophy.aggregate({
          _avg: {
            quality: true,
          },
          where: { stackId: stack.id },
        }),
        prisma.project.count({ where: { stackId: stack.id, progress: 100 } }),
        prisma.project.aggregate({
          _avg: {
            progress: true,
          },
          where: { stackId: stack.id },
        }),
      ]);

      if (avgQuality._avg.quality) {
        stackData.quality = Number(avgQuality._avg.quality);
      }

      stackData.timesCompleted = timesCompleted;

      if (avgProgress._avg.progress) {
        stackData.avgProgress = avgProgress._avg.progress;
      }

      const updateStack = await prisma.stack.update({
        where: { id: stack.id },
        data: stackData,
      });

      await prisma.stackChange.update({
        where: {
          id: createStackChange.id,
        },
        data: {
          definedPlatinumTo: updateStack.definedPlatinum,
          definedGoldTo: updateStack.definedGold,
          definedSilverTo: updateStack.definedSilver,
          definedBronzeTo: updateStack.definedBronze,
          qualityTo: updateStack.quality,
          timesStartedTo: updateStack.timesStarted,
          timesCompletedTo: updateStack.timesCompleted,
          avgProgressTo: updateStack.avgProgress,
          valueTo: updateStack.value,
        },
      });

      return {
        data: {
          project: updateProject,
          changes: {
            new: newProject,
            progress: {
              old: project.progress,
              new: updateProject.progress,
            },
            trophies: {
              defined: {
                platinum: newProject ? updateStack.definedPlatinum : 0,
                gold: newProject ? updateStack.definedGold : 0,
                silver: newProject ? updateStack.definedSilver : 0,
                bronze: newProject ? updateStack.definedBronze : 0,
              },
              earned: {
                platinum: updateProject.earnedPlatinum - project.earnedPlatinum,
                gold: updateProject.earnedGold - project.earnedGold,
                silver: updateProject.earnedSilver - project.earnedSilver,
                bronze: updateProject.earnedBronze - project.earnedBronze,
              },
            },
            points:
              Math.round(
                (Number(updateProject.points) -
                  Number(project.points) +
                  Number.EPSILON) *
                  100,
              ) / 100,
            streamPoints:
              Math.round(
                (Number(updateProject.streamPoints) -
                  Number(project.streamPoints) +
                  Number.EPSILON) *
                  100,
              ) / 100,
          },
          newStreamTrophies,
          streamId,
        },
      };
    }

    return {
      data: {
        project: findProjectWithStack,
        changes: {
          new: false,
          progress: {
            old: findProjectWithStack.progress,
            new: findProjectWithStack.progress,
          },
          trophies: {
            defined: {
              platinum: 0,
              gold: 0,
              silver: 0,
              bronze: 0,
            },
            earned: {
              platinum: 0,
              gold: 0,
              silver: 0,
              bronze: 0,
            },
          },
          points: 0,
          streamPoints: 0,
        },
        newStreamTrophies,
        streamId,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
