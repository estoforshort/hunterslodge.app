import { updateProjectAndStackTrophy } from "./trophy";
import dayjs from "dayjs";

import type { TrophyType } from "@prisma/client";

type Data = {
  updateId: number;
  stackChangeId: string;
  profilesCount: number;
  profile: {
    id: number;
    accountId: string;
    createdAt: Date;
  };
  game: {
    id: number;
    service: string;
  };
  stack: {
    id: string;
    timesStarted: number;
  };
  group: {
    trophyGroupId: string;
    progress: number;
    earnedTrophies: {
      bronze: number;
      silver: number;
      gold: number;
      platinum: number;
    };
  };
};

export const updateProjectAndStackGroup = async (data: Data) => {
  try {
    let updateSuccessful = true;

    const findProjectGroupWithStackGroupAndGameGroup =
      await prisma.projectGroup.findUnique({
        where: {
          profileId_stackId_groupId: {
            profileId: data.profile.id,
            stackId: data.stack.id,
            groupId:
              data.group.trophyGroupId === "default"
                ? "000"
                : data.group.trophyGroupId,
          },
        },
        include: { stackGroup: { include: { gameGroup: true } } },
      });

    const newStreamTrophies = {
      platinum: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
    };

    let streamId = null as string | null;

    if (
      !findProjectGroupWithStackGroupAndGameGroup ||
      findProjectGroupWithStackGroupAndGameGroup.stackGroup.profilesCount !==
        data.profilesCount ||
      findProjectGroupWithStackGroupAndGameGroup.earnedPlatinum !==
        data.group.earnedTrophies.platinum ||
      findProjectGroupWithStackGroupAndGameGroup.earnedGold !==
        data.group.earnedTrophies.gold ||
      findProjectGroupWithStackGroupAndGameGroup.earnedSilver !==
        data.group.earnedTrophies.silver ||
      findProjectGroupWithStackGroupAndGameGroup.earnedBronze !==
        data.group.earnedTrophies.bronze ||
      findProjectGroupWithStackGroupAndGameGroup.progress !==
        data.group.progress ||
      Number(findProjectGroupWithStackGroupAndGameGroup.value) !==
        Number(findProjectGroupWithStackGroupAndGameGroup.stackGroup.value) ||
      findProjectGroupWithStackGroupAndGameGroup.stackGroup.definedPlatinum !==
        findProjectGroupWithStackGroupAndGameGroup.stackGroup.gameGroup
          .definedPlatinum ||
      findProjectGroupWithStackGroupAndGameGroup.stackGroup.definedGold !==
        findProjectGroupWithStackGroupAndGameGroup.stackGroup.gameGroup
          .definedGold ||
      findProjectGroupWithStackGroupAndGameGroup.stackGroup.definedSilver !==
        findProjectGroupWithStackGroupAndGameGroup.stackGroup.gameGroup
          .definedSilver ||
      findProjectGroupWithStackGroupAndGameGroup.stackGroup.definedBronze !==
        findProjectGroupWithStackGroupAndGameGroup.stackGroup.gameGroup
          .definedBronze
    ) {
      const trophies: {
        trophyId: number;
        earned: boolean;
        earnedDateTime: string | Date | null | undefined;
        trophyType: TrophyType;
        trophyEarnedRate: string;
      }[] = [];

      if (
        !findProjectGroupWithStackGroupAndGameGroup ||
        findProjectGroupWithStackGroupAndGameGroup.earnedPlatinum !==
          data.group.earnedTrophies.platinum ||
        findProjectGroupWithStackGroupAndGameGroup.earnedGold !==
          data.group.earnedTrophies.gold ||
        findProjectGroupWithStackGroupAndGameGroup.earnedSilver !==
          data.group.earnedTrophies.silver ||
        findProjectGroupWithStackGroupAndGameGroup.earnedBronze !==
          data.group.earnedTrophies.bronze ||
        findProjectGroupWithStackGroupAndGameGroup.progress !==
          data.group.progress ||
        findProjectGroupWithStackGroupAndGameGroup.stackGroup
          .definedPlatinum !==
          findProjectGroupWithStackGroupAndGameGroup.stackGroup.gameGroup
            .definedPlatinum ||
        findProjectGroupWithStackGroupAndGameGroup.stackGroup.definedGold !==
          findProjectGroupWithStackGroupAndGameGroup.stackGroup.gameGroup
            .definedGold ||
        findProjectGroupWithStackGroupAndGameGroup.stackGroup.definedSilver !==
          findProjectGroupWithStackGroupAndGameGroup.stackGroup.gameGroup
            .definedSilver ||
        findProjectGroupWithStackGroupAndGameGroup.stackGroup.definedBronze !==
          findProjectGroupWithStackGroupAndGameGroup.stackGroup.gameGroup
            .definedBronze
      ) {
        const getTrophiesFromPsn = await psn.projectGroupTrophies({
          accountId: data.profile.accountId,
          npCommunicationId: data.stack.id,
          trophyGroupId: data.group.trophyGroupId,
          npServiceName: data.game.service,
        });

        if (!getTrophiesFromPsn.data) {
          return {
            data: null,
          };
        }

        for (
          let t = 0, tl = getTrophiesFromPsn.data.trophies.length;
          t < tl;
          t++
        ) {
          const trophy = getTrophiesFromPsn.data.trophies[t];

          trophies.push({
            trophyId: trophy.trophyId,
            earned: trophy.earned,
            earnedDateTime: trophy.earnedDateTime,
            trophyType: trophy.trophyType,
            trophyEarnedRate: trophy.trophyEarnedRate,
          });
        }
      } else {
        const [stackGroupTrophies, projectGroupTrophies] = await Promise.all([
          prisma.stackTrophy.findMany({
            select: {
              trophyId: true,
              gameTrophy: {
                select: {
                  type: true,
                },
              },
              psnRate: true,
            },
            where: {
              stackId: data.stack.id,
              groupId: data.group.trophyGroupId,
            },
            orderBy: { trophyId: "asc" },
          }),
          prisma.projectTrophy.findMany({
            select: {
              trophyId: true,
              earnedAt: true,
            },
            where: {
              profileId: data.profile.id,
              stackId: data.stack.id,
              groupId: data.group.trophyGroupId,
            },
            orderBy: { trophyId: "asc" },
          }),
        ]);

        for (let t = 0, tl = stackGroupTrophies.length; t < tl; t++) {
          const trophy = stackGroupTrophies[t];

          const earned = projectGroupTrophies.find(
            (t) => t.trophyId === trophy.trophyId,
          );

          if (earned) {
            trophies.push({
              trophyId: trophy.trophyId,
              earned: true,
              earnedDateTime: earned.earnedAt,
              trophyType: trophy.gameTrophy.type,
              trophyEarnedRate: trophy.psnRate.toString(),
            });
          } else {
            trophies.push({
              trophyId: trophy.trophyId,
              earned: false,
              earnedDateTime: null,
              trophyType: trophy.gameTrophy.type,
              trophyEarnedRate: trophy.psnRate.toString(),
            });
          }
        }
      }

      if (!trophies.length) {
        return {
          data: null,
        };
      }

      const gameGroup = await prisma.group.findUnique({
        where: {
          gameId_id: {
            gameId: data.game.id,
            id:
              data.group.trophyGroupId === "default"
                ? "000"
                : data.group.trophyGroupId,
          },
        },
      });

      if (!gameGroup) {
        return {
          data: null,
        };
      }

      const getStackGroup = async () => {
        const findStackGroup = await prisma.stackGroup.findUnique({
          where: {
            stackId_groupId: {
              stackId: data.stack.id,
              groupId:
                data.group.trophyGroupId === "default"
                  ? "000"
                  : data.group.trophyGroupId,
            },
          },
        });

        if (findStackGroup) return findStackGroup;

        return await prisma.stackGroup.create({
          data: {
            stackId: data.stack.id,
            gameId: data.game.id,
            groupId:
              data.group.trophyGroupId === "default"
                ? "000"
                : data.group.trophyGroupId,
          },
        });
      };

      const stackGroup = await getStackGroup();

      const getProjectGroup = async () => {
        const findProjectGroup = await prisma.projectGroup.findUnique({
          where: {
            profileId_stackId_groupId: {
              profileId: data.profile.id,
              stackId: data.stack.id,
              groupId:
                data.group.trophyGroupId === "default"
                  ? "000"
                  : data.group.trophyGroupId,
            },
          },
        });

        if (findProjectGroup) return findProjectGroup;

        return await prisma.projectGroup.create({
          data: {
            profileId: data.profile.id,
            stackId: data.stack.id,
            groupId:
              data.group.trophyGroupId === "default"
                ? "000"
                : data.group.trophyGroupId,
          },
        });
      };

      const projectGroup = await getProjectGroup();

      const projectGroupData = {
        earnedPlatinum: data.group.earnedTrophies.platinum,
        earnedGold: data.group.earnedTrophies.gold,
        earnedSilver: data.group.earnedTrophies.silver,
        earnedBronze: data.group.earnedTrophies.bronze,
        streamPlatinum: 0,
        streamGold: 0,
        streamSilver: 0,
        streamBronze: 0,
        firstTrophyEarnedAt: projectGroup.firstTrophyEarnedAt,
        lastTrophyEarnedAt: projectGroup.lastTrophyEarnedAt,
        progress: data.group.progress,
        value: 0,
        points: 0,
        streamPoints: 0,
      };

      const stackGroupData = {
        definedPlatinum: gameGroup.definedPlatinum,
        definedGold: gameGroup.definedGold,
        definedSilver: gameGroup.definedSilver,
        definedBronze: gameGroup.definedBronze,
        firstTrophyEarnedAt: stackGroup.firstTrophyEarnedAt,
        lastTrophyEarnedAt: stackGroup.lastTrophyEarnedAt,
        quality: 0,
        profilesCount: data.profilesCount,
        timesCompleted: stackGroup.timesCompleted,
        avgProgress: 0,
        value: 0,
      };

      const getProjectGroupChange = async () => {
        const findProjectGroupChange =
          await prisma.projectGroupChange.findUnique({
            where: {
              updateId_stackId_groupId: {
                updateId: data.updateId,
                stackId: data.stack.id,
                groupId: projectGroup.groupId,
              },
            },
          });

        if (findProjectGroupChange) {
          return await prisma.projectGroupChange.update({
            data: {
              earnedPlatinumFrom: projectGroup.earnedPlatinum,
              earnedGoldFrom: projectGroup.earnedGold,
              earnedSilverFrom: projectGroup.earnedSilver,
              earnedBronzeFrom: projectGroup.earnedBronze,
              streamPlatinumFrom: projectGroup.streamPlatinum,
              streamGoldFrom: projectGroup.streamGold,
              streamSilverFrom: projectGroup.streamSilver,
              streamBronzeFrom: projectGroup.streamBronze,
              progressFrom: projectGroup.progress,
              pointsFrom: projectGroup.points,
              streamPointsFrom: projectGroup.streamPoints,
            },
            where: {
              updateId_stackId_groupId: {
                updateId: data.updateId,
                stackId: data.stack.id,
                groupId: projectGroup.groupId,
              },
            },
          });
        }

        return await prisma.projectGroupChange.create({
          data: {
            updateId: data.updateId,
            stackId: data.stack.id,
            profileId: data.profile.id,
            groupId: projectGroup.groupId,
            earnedPlatinumFrom: projectGroup.earnedPlatinum,
            earnedGoldFrom: projectGroup.earnedGold,
            earnedSilverFrom: projectGroup.earnedSilver,
            earnedBronzeFrom: projectGroup.earnedBronze,
            streamPlatinumFrom: projectGroup.streamPlatinum,
            streamGoldFrom: projectGroup.streamGold,
            streamSilverFrom: projectGroup.streamSilver,
            streamBronzeFrom: projectGroup.streamBronze,
            progressFrom: projectGroup.progress,
            pointsFrom: projectGroup.points,
            streamPointsFrom: projectGroup.streamPoints,
          },
        });
      };

      const [createProjectGroupChange, createStackGroupChange] =
        await Promise.all([
          getProjectGroupChange(),
          prisma.stackGroupChange.create({
            data: {
              stackChangeId: data.stackChangeId,
              stackId: stackGroup.stackId,
              groupId: stackGroup.groupId,
              definedPlatinumFrom: stackGroup.definedPlatinum,
              definedGoldFrom: stackGroup.definedGold,
              definedSilverFrom: stackGroup.definedSilver,
              definedBronzeFrom: stackGroup.definedBronze,
              qualityFrom: stackGroup.quality,
              timesCompletedFrom: stackGroup.timesCompleted,
              avgProgressFrom: stackGroup.avgProgress,
              valueFrom: stackGroup.value,
            },
          }),
        ]);

      const trophiesToUpdate = [];

      for (let t = 0, tl = trophies.length; t < tl; t++) {
        const trophy = trophies[t];

        trophiesToUpdate.push(
          updateProjectAndStackTrophy({
            updateId: data.updateId,
            stackChangeId: data.stackChangeId,
            profilesCount: data.profilesCount,
            profile: {
              id: data.profile.id,
              createdAt: data.profile.createdAt,
            },
            gameId: data.game.id,
            groupId: gameGroup.id,
            stackId: data.stack.id,
            trophy,
          }).then((updatedTrophy) => {
            if (!updatedTrophy.data) {
              updateSuccessful = false;
            } else {
              if (updatedTrophy.data.projectTrophy) {
                const projectTrophy = updatedTrophy.data.projectTrophy;

                if (projectTrophy.earnedAt) {
                  if (
                    !projectGroupData.firstTrophyEarnedAt ||
                    dayjs(projectTrophy.earnedAt).isBefore(
                      projectGroupData.firstTrophyEarnedAt,
                    )
                  ) {
                    projectGroupData.firstTrophyEarnedAt = dayjs(
                      projectTrophy.earnedAt,
                    ).format() as unknown as Date;
                  }

                  if (
                    !projectGroupData.lastTrophyEarnedAt ||
                    dayjs(projectTrophy.earnedAt).isAfter(
                      projectGroupData.lastTrophyEarnedAt,
                    )
                  ) {
                    projectGroupData.lastTrophyEarnedAt = dayjs(
                      projectTrophy.earnedAt,
                    ).format() as unknown as Date;
                  }
                }

                projectGroupData.points += Number(projectTrophy.points);

                if (updatedTrophy.data.streamTrophy) {
                  if (trophy.trophyType === "platinum") {
                    projectGroupData.streamPlatinum += 1;

                    if (updatedTrophy.data.streamId) {
                      newStreamTrophies.platinum += 1;
                    }
                  }

                  if (trophy.trophyType === "gold") {
                    projectGroupData.streamGold += 1;

                    if (updatedTrophy.data.streamId) {
                      newStreamTrophies.gold += 1;
                    }
                  }

                  if (trophy.trophyType === "silver") {
                    projectGroupData.streamSilver += 1;

                    if (updatedTrophy.data.streamId) {
                      newStreamTrophies.silver += 1;
                    }
                  }

                  if (trophy.trophyType === "bronze") {
                    projectGroupData.streamBronze += 1;

                    if (updatedTrophy.data.streamId) {
                      newStreamTrophies.bronze += 1;
                    }
                  }

                  if (updatedTrophy.data.streamId && !streamId) {
                    streamId = updatedTrophy.data.streamId;
                  }

                  projectGroupData.streamPoints += Number(projectTrophy.points);
                }
              }

              const stackTrophy = updatedTrophy.data.stackTrophy;

              projectGroupData.value += Number(stackTrophy.value);

              if (stackTrophy.firstEarnedAt) {
                if (
                  !stackGroupData.firstTrophyEarnedAt ||
                  dayjs(stackTrophy.firstEarnedAt).isBefore(
                    stackGroupData.firstTrophyEarnedAt,
                  )
                ) {
                  stackGroupData.firstTrophyEarnedAt = dayjs(
                    stackTrophy.firstEarnedAt,
                  ).format() as unknown as Date;
                }
              }

              if (stackTrophy.lastEarnedAt) {
                if (
                  !stackGroupData.lastTrophyEarnedAt ||
                  dayjs(stackTrophy.lastEarnedAt).isAfter(
                    stackGroupData.lastTrophyEarnedAt,
                  )
                ) {
                  stackGroupData.lastTrophyEarnedAt = dayjs(
                    stackTrophy.lastEarnedAt,
                  ).format() as unknown as Date;
                }
              }

              stackGroupData.quality += Number(stackTrophy.quality);
              stackGroupData.value += Number(stackTrophy.value);
            }
          }),
        );
      }

      await Promise.all(trophiesToUpdate);

      if (!updateSuccessful) {
        await Promise.all([
          await prisma.projectGroupChange.delete({
            where: {
              updateId_stackId_groupId: {
                updateId: createProjectGroupChange.updateId,
                stackId: createProjectGroupChange.stackId,
                groupId: createProjectGroupChange.groupId,
              },
            },
          }),
          await prisma.stackGroupChange.delete({
            where: {
              stackChangeId_stackId_groupId: {
                stackChangeId: createStackGroupChange.stackChangeId,
                stackId: createStackGroupChange.stackId,
                groupId: createStackGroupChange.groupId,
              },
            },
          }),
        ]);

        return {
          data: null,
        };
      }

      projectGroupData.points =
        Math.round((projectGroupData.points + Number.EPSILON) * 100) / 100;
      projectGroupData.streamPoints =
        Math.round((projectGroupData.streamPoints + Number.EPSILON) * 100) /
        100;

      projectGroupData.value =
        Math.round((projectGroupData.value + Number.EPSILON) * 100) / 100;
      stackGroupData.value =
        Math.round((stackGroupData.value + Number.EPSILON) * 100) / 100;

      const updateProjectGroup = await prisma.projectGroup.update({
        where: {
          profileId_stackId_groupId: {
            profileId: data.profile.id,
            stackId: data.stack.id,
            groupId: stackGroup.groupId,
          },
        },
        data: projectGroupData,
      });

      await prisma.projectGroupChange.update({
        where: {
          updateId_stackId_groupId: {
            updateId: createProjectGroupChange.updateId,
            stackId: createProjectGroupChange.stackId,
            groupId: createProjectGroupChange.groupId,
          },
        },
        data: {
          earnedPlatinumTo: updateProjectGroup.earnedPlatinum,
          earnedGoldTo: updateProjectGroup.earnedGold,
          earnedSilverTo: updateProjectGroup.earnedSilver,
          earnedBronzeTo: updateProjectGroup.earnedBronze,
          streamPlatinumTo: updateProjectGroup.streamPlatinum,
          streamGoldTo: updateProjectGroup.streamGold,
          streamSilverTo: updateProjectGroup.streamSilver,
          streamBronzeTo: updateProjectGroup.streamBronze,
          progressTo: updateProjectGroup.progress,
          pointsTo: updateProjectGroup.points,
          streamPointsTo: updateProjectGroup.streamPoints,
        },
      });

      stackGroupData.quality =
        Math.round(
          (stackGroupData.quality / trophies.length + Number.EPSILON) * 100,
        ) / 100;

      if (projectGroup.progress !== 100 && data.group.progress === 100) {
        stackGroupData.timesCompleted += 1;
      }

      if (projectGroup.progress === 100 && data.group.progress !== 100) {
        stackGroupData.timesCompleted -= 1;
      }

      const projectGroups = await prisma.projectGroup.aggregate({
        _avg: {
          progress: true,
        },
        where: {
          stackId: data.stack.id,
          groupId: stackGroup.groupId,
        },
      });

      if (projectGroups._avg.progress) {
        stackGroupData.avgProgress = Math.round(projectGroups._avg.progress);
      }

      const updateStackGroup = await prisma.stackGroup.update({
        where: {
          stackId_groupId: {
            stackId: data.stack.id,
            groupId: stackGroup.groupId,
          },
        },
        data: stackGroupData,
      });

      await prisma.stackGroupChange.update({
        where: {
          stackChangeId_stackId_groupId: {
            stackChangeId: createStackGroupChange.stackChangeId,
            stackId: createStackGroupChange.stackId,
            groupId: createStackGroupChange.groupId,
          },
        },
        data: {
          definedPlatinumTo: updateStackGroup.definedPlatinum,
          definedGoldTo: updateStackGroup.definedGold,
          definedSilverTo: updateStackGroup.definedSilver,
          definedBronzeTo: updateStackGroup.definedBronze,
          qualityTo: updateStackGroup.quality,
          timesCompletedTo: updateStackGroup.timesCompleted,
          avgProgressTo: updateStackGroup.avgProgress,
          valueTo: updateStackGroup.value,
        },
      });

      return {
        data: {
          projectGroup: updateProjectGroup,
          stackGroup: updateStackGroup,
          newStreamTrophies,
          streamId,
        },
      };
    }

    return {
      data: {
        projectGroup: findProjectGroupWithStackGroupAndGameGroup,
        stackGroup: findProjectGroupWithStackGroupAndGameGroup.stackGroup,
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
