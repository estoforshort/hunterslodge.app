import { updateProjectAndStackTrophy } from "./trophy";
import dayjs from "dayjs";

import type { Prisma } from "@prisma/client";

type Data = {
  profile: {
    id: number;
    accountId: string;
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
      const trophies = await psn.projectGroupTrophies({
        accountId: data.profile.accountId,
        npCommunicationId: data.stack.id,
        trophyGroupId: data.group.trophyGroupId,
        npServiceName: data.game.service,
      });

      if (!trophies.data) {
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
        firstTrophyEarnedAt: projectGroup.firstTrophyEarnedAt,
        lastTrophyEarnedAt: projectGroup.lastTrophyEarnedAt,
        progress: data.group.progress,
      };

      const stackGroupData = {
        definedPlatinum: gameGroup.definedPlatinum,
        definedGold: gameGroup.definedGold,
        definedSilver: gameGroup.definedSilver,
        definedBronze: gameGroup.definedBronze,
        firstTrophyEarnedAt: stackGroup.firstTrophyEarnedAt,
        lastTrophyEarnedAt: stackGroup.lastTrophyEarnedAt,
        psnRate: 0 as unknown as Prisma.Decimal,
        timesCompleted: stackGroup.timesCompleted,
        avgProgress: 0,
      };

      for (let t = 0, tl = trophies.data.trophies.length; t < tl; t++) {
        const trophy = trophies.data.trophies[t];

        const updatedTrophy = await updateProjectAndStackTrophy({
          profileId: data.profile.id,
          gameId: data.game.id,
          groupId: gameGroup.id,
          stack: {
            id: data.stack.id,
            timesStarted: data.stack.timesStarted,
          },
          trophy,
        });

        if (!updatedTrophy.data) {
          updateSuccessful = false;
          break;
        }

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
        }

        const stackTrophy = updatedTrophy.data.stackTrophy;

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

        stackGroupData.psnRate = (Number(stackGroupData.psnRate) +
          Number(stackTrophy.psnRate)) as unknown as Prisma.Decimal;
      }

      if (!updateSuccessful) {
        return {
          data: null,
        };
      }

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

      stackGroupData.psnRate = (Math.round(
        (Number(stackGroupData.psnRate) / trophies.data.trophies.length +
          Number.EPSILON) *
          100,
      ) / 100) as unknown as Prisma.Decimal;

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

      const stackGroups = await prisma.stackGroup.findMany({
        where: { gameId: data.game.id, groupId: stackGroup.groupId },
      });

      const gameGroupData = {
        firstTrophyEarnedAt: gameGroup.firstTrophyEarnedAt,
        lastTrophyEarnedAt: gameGroup.lastTrophyEarnedAt,
        psnRate: 0 as unknown as Prisma.Decimal,
        timesCompleted: 0,
        avgProgress: 0,
      };

      for (let sg = 0, sgl = stackGroups.length; sg < sgl; sg++) {
        const group = stackGroups[sg];

        if (group.firstTrophyEarnedAt) {
          if (
            !gameGroupData.firstTrophyEarnedAt ||
            dayjs(group.firstTrophyEarnedAt).isBefore(
              gameGroupData.firstTrophyEarnedAt,
            )
          ) {
            gameGroupData.firstTrophyEarnedAt = dayjs(
              group.firstTrophyEarnedAt,
            ).format() as unknown as Date;
          }
        }

        if (group.lastTrophyEarnedAt) {
          if (
            !gameGroupData.lastTrophyEarnedAt ||
            dayjs(group.lastTrophyEarnedAt).isAfter(
              gameGroupData.lastTrophyEarnedAt,
            )
          ) {
            gameGroupData.lastTrophyEarnedAt = dayjs(
              group.lastTrophyEarnedAt,
            ).format() as unknown as Date;
          }
        }

        gameGroupData.psnRate = (Number(gameGroupData.psnRate) +
          Number(group.psnRate)) as unknown as Prisma.Decimal;
        gameGroupData.timesCompleted += group.timesCompleted;
        gameGroupData.avgProgress += group.avgProgress;
      }

      gameGroupData.psnRate = (Math.round(
        (Number(gameGroupData.psnRate) / stackGroups.length + Number.EPSILON) *
          100,
      ) / 100) as unknown as Prisma.Decimal;

      gameGroupData.avgProgress = Math.round(
        gameGroupData.avgProgress / stackGroups.length,
      );

      await prisma.group.update({
        where: {
          gameId_id: {
            gameId: data.game.id,
            id: gameGroup.id,
          },
        },
        data: gameGroupData,
      });

      return {
        data: {
          projectGroup: updateProjectGroup,
          stackGroup: updateStackGroup,
        },
      };
    }

    return {
      data: {
        projectGroup: findProjectGroupWithStackGroupAndGameGroup,
        stackGroup: findProjectGroupWithStackGroupAndGameGroup.stackGroup,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
