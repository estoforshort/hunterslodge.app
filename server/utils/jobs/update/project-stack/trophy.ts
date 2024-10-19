import dayjs from "dayjs";

import type { Prisma, TrophyType } from "@prisma/client";

type Data = {
  profileId: number;
  gameId: number;
  groupId: string;
  stack: {
    id: string;
    timesStarted: number;
  };
  trophy: {
    trophyId: number;
    earned: boolean;
    earnedDateTime: string | undefined;
    trophyType: TrophyType;
    trophyEarnedRate: string;
  };
};

export const updateProjectAndStackTrophy = async (data: Data) => {
  try {
    const getStackTrophy = async () => {
      const findStackTrophy = await prisma.stackTrophy.findUnique({
        where: {
          stackId_groupId_trophyId: {
            stackId: data.stack.id,
            groupId: data.groupId,
            trophyId: data.trophy.trophyId,
          },
        },
      });

      if (findStackTrophy) return findStackTrophy;

      return await prisma.stackTrophy.create({
        data: {
          stackId: data.stack.id,
          groupId: data.groupId,
          gameId: data.gameId,
          trophyId: data.trophy.trophyId,
        },
      });
    };

    const [findProjectTrophy, stackTrophy] = await Promise.all([
      prisma.projectTrophy.findUnique({
        where: {
          profileId_stackId_groupId_trophyId: {
            profileId: data.profileId,
            stackId: data.stack.id,
            groupId: data.groupId,
            trophyId: data.trophy.trophyId,
          },
        },
      }),
      getStackTrophy(),
    ]);

    const stackTrophyData = {
      firstEarnedAt: stackTrophy.firstEarnedAt,
      lastEarnedAt: stackTrophy.lastEarnedAt,
      psnRate: data.trophy.trophyEarnedRate as unknown as Prisma.Decimal,
      timesEarned: stackTrophy.timesEarned,
      rate: stackTrophy.rate,
    };

    if (data.trophy.earned) {
      if (!findProjectTrophy) {
        if (data.trophy.earnedDateTime) {
          if (
            !stackTrophyData.firstEarnedAt ||
            dayjs(data.trophy.earnedDateTime).isBefore(
              dayjs(stackTrophyData.firstEarnedAt),
            )
          ) {
            stackTrophyData.firstEarnedAt = dayjs(
              data.trophy.earnedDateTime,
            ).format() as unknown as Date;
          }

          if (
            !stackTrophyData.lastEarnedAt ||
            dayjs(data.trophy.earnedDateTime).isAfter(
              dayjs(stackTrophyData.lastEarnedAt),
            )
          ) {
            stackTrophyData.lastEarnedAt = dayjs(
              data.trophy.earnedDateTime,
            ).format() as unknown as Date;
          }
        }

        stackTrophyData.timesEarned += 1;
        stackTrophyData.rate = (Math.round(
          ((100 * stackTrophyData.timesEarned) / data.stack.timesStarted +
            Number.EPSILON) *
            100,
        ) / 100) as unknown as Prisma.Decimal;

        const [createProjectTrophy, updateStackTrophy] = await Promise.all([
          prisma.projectTrophy.create({
            data: {
              profileId: data.profileId,
              stackId: data.stack.id,
              groupId: data.groupId,
              trophyId: data.trophy.trophyId,
              appId: "app",
              earnedAt: data.trophy.earnedDateTime
                ? dayjs(data.trophy.earnedDateTime).format()
                : null,
            },
          }),
          prisma.stackTrophy.update({
            where: {
              stackId_groupId_trophyId: {
                stackId: stackTrophy.stackId,
                groupId: stackTrophy.groupId,
                trophyId: stackTrophy.trophyId,
              },
            },
            data: stackTrophyData,
          }),
        ]);

        const stackTrophies = await prisma.stackTrophy.findMany({
          select: {
            firstEarnedAt: true,
            lastEarnedAt: true,
            psnRate: true,
            timesEarned: true,
            rate: true,
          },
          where: {
            gameId: data.gameId,
            trophyId: data.trophy.trophyId,
          },
        });

        const gameTrophyData = {
          firstEarnedAt: null as null | Date,
          lastEarnedAt: null as null | Date,
          psnRate: 0 as unknown as Prisma.Decimal,
          timesEarned: 0,
          rate: 0 as unknown as Prisma.Decimal,
        };

        for (let st = 0, stl = stackTrophies.length; st < stl; st++) {
          const trophy = stackTrophies[st];

          if (trophy.firstEarnedAt) {
            if (
              !gameTrophyData.firstEarnedAt ||
              dayjs(trophy.firstEarnedAt).isBefore(gameTrophyData.firstEarnedAt)
            ) {
              gameTrophyData.firstEarnedAt = dayjs(
                trophy.firstEarnedAt,
              ).format() as unknown as Date;
            }
          }

          if (trophy.lastEarnedAt) {
            if (
              !gameTrophyData.lastEarnedAt ||
              dayjs(trophy.lastEarnedAt).isAfter(gameTrophyData.lastEarnedAt)
            ) {
              gameTrophyData.lastEarnedAt = dayjs(
                trophy.lastEarnedAt,
              ).format() as unknown as Date;
            }
          }

          gameTrophyData.psnRate = (Number(gameTrophyData.psnRate) +
            Number(trophy.psnRate)) as unknown as Prisma.Decimal;
          gameTrophyData.timesEarned += trophy.timesEarned;
          gameTrophyData.rate = (Number(gameTrophyData.rate) +
            Number(trophy.rate)) as unknown as Prisma.Decimal;
        }

        gameTrophyData.psnRate = (Math.round(
          (Number(gameTrophyData.psnRate) / stackTrophies.length +
            Number.EPSILON) *
            100,
        ) / 100) as unknown as Prisma.Decimal;

        gameTrophyData.rate = (Math.round(
          (Number(gameTrophyData.rate) / stackTrophies.length +
            Number.EPSILON) *
            100,
        ) / 100) as unknown as Prisma.Decimal;

        await prisma.trophy.update({
          where: {
            gameId_groupId_id: {
              gameId: data.gameId,
              groupId: data.groupId,
              id: data.trophy.trophyId,
            },
          },
          data: gameTrophyData,
        });

        return {
          data: {
            projectTrophy: createProjectTrophy,
            stackTrophy: updateStackTrophy,
          },
        };
      }

      if (Number(stackTrophyData.psnRate) !== Number(stackTrophy.psnRate)) {
        return {
          data: {
            projectTrophy: findProjectTrophy,
            stackTrophy: await prisma.stackTrophy.update({
              where: {
                stackId_groupId_trophyId: {
                  stackId: stackTrophy.stackId,
                  groupId: stackTrophy.groupId,
                  trophyId: stackTrophy.trophyId,
                },
              },
              data: stackTrophyData,
            }),
          },
        };
      }

      return {
        data: {
          projectTrophy: findProjectTrophy,
          stackTrophy: stackTrophy,
        },
      };
    }

    if (Number(stackTrophyData.psnRate) !== Number(stackTrophy.psnRate)) {
      return {
        data: {
          projectTrophy: findProjectTrophy,
          stackTrophy: await prisma.stackTrophy.update({
            where: {
              stackId_groupId_trophyId: {
                stackId: stackTrophy.stackId,
                groupId: stackTrophy.groupId,
                trophyId: stackTrophy.trophyId,
              },
            },
            data: stackTrophyData,
          }),
        },
      };
    }

    return {
      data: {
        projectTrophy: findProjectTrophy,
        stackTrophy: stackTrophy,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
