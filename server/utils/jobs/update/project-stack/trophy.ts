import dayjs from "dayjs";

import type { Prisma, TrophyType } from "@prisma/client";

type Data = {
  profile: {
    id: number;
    completion: number;
  };
  gameId: number;
  group: {
    id: string;
    progress: number;
  };
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
            groupId: data.group.id,
            trophyId: data.trophy.trophyId,
          },
        },
      });

      if (findStackTrophy) return findStackTrophy;

      return await prisma.stackTrophy.create({
        data: {
          stackId: data.stack.id,
          groupId: data.group.id,
          gameId: data.gameId,
          trophyId: data.trophy.trophyId,
        },
      });
    };

    const [findProjectTrophy, stackTrophy] = await Promise.all([
      prisma.projectTrophy.findUnique({
        where: {
          profileId_stackId_groupId_trophyId: {
            profileId: data.profile.id,
            stackId: data.stack.id,
            groupId: data.group.id,
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
      ratio: stackTrophy.ratio,
      value: stackTrophy.value,
    };

    if (data.trophy.earned && !findProjectTrophy) {
      stackTrophyData.timesEarned += 1;

      stackTrophyData.rate = (Math.round(
        ((100 * stackTrophyData.timesEarned) / data.stack.timesStarted +
          Number.EPSILON) *
          100,
      ) / 100) as unknown as Prisma.Decimal;

      if (stackTrophyData.timesEarned) {
        stackTrophyData.ratio = (Math.round(
          (data.stack.timesStarted / stackTrophyData.timesEarned +
            Number.EPSILON) *
            100,
        ) / 100) as unknown as Prisma.Decimal;
      } else {
        stackTrophyData.ratio = data.stack
          .timesStarted as unknown as Prisma.Decimal;
      }
    }

    switch (data.trophy.trophyType) {
      case "platinum": {
        const valueLoss = (Number(stackTrophyData.psnRate) / 100) * 300;
        stackTrophyData.value = (300 - valueLoss) as unknown as Prisma.Decimal;
        break;
      }

      case "gold": {
        const valueLoss = (Number(stackTrophyData.psnRate) / 100) * 90;
        stackTrophyData.value = (90 - valueLoss) as unknown as Prisma.Decimal;
        break;
      }

      case "silver": {
        const valueLoss = (Number(stackTrophyData.psnRate) / 100) * 30;
        stackTrophyData.value = (30 - valueLoss) as unknown as Prisma.Decimal;
        break;
      }

      case "bronze": {
        const valueLoss = (Number(stackTrophy.psnRate) / 100) * 15;
        stackTrophyData.value = (15 - valueLoss) as unknown as Prisma.Decimal;
        break;
      }
    }

    stackTrophyData.value = (Math.round(
      (Number(stackTrophyData.ratio) * Number(stackTrophyData.value) +
        Number.EPSILON) *
        100,
    ) / 100) as unknown as Prisma.Decimal;

    if (data.trophy.earned) {
      let points = 0 as unknown as Prisma.Decimal;

      points = (Math.round(
        ((data.group.progress / 100) * Number(stackTrophyData.value) +
          Number.EPSILON) *
          100,
      ) / 100) as unknown as Prisma.Decimal;

      points = (Math.round(
        ((data.profile.completion / 100) * Number(points) + Number.EPSILON) *
          100,
      ) / 100) as unknown as Prisma.Decimal;

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

        const [createProjectTrophy, updateStackTrophy] = await Promise.all([
          prisma.projectTrophy.create({
            data: {
              profileId: data.profile.id,
              stackId: data.stack.id,
              groupId: data.group.id,
              trophyId: data.trophy.trophyId,
              appId: "app",
              earnedAt: data.trophy.earnedDateTime
                ? dayjs(data.trophy.earnedDateTime).format()
                : null,
              points,
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

        return {
          data: {
            projectTrophy: createProjectTrophy,
            stackTrophy: updateStackTrophy,
          },
        };
      }

      if (
        Number(stackTrophyData.psnRate) !== Number(stackTrophy.psnRate) ||
        Number(stackTrophyData.value) !== Number(stackTrophy.value)
      ) {
        if (Number(points) !== Number(findProjectTrophy.points)) {
          return {
            data: {
              projectTrophy: await prisma.projectTrophy.update({
                where: {
                  profileId_stackId_groupId_trophyId: {
                    profileId: findProjectTrophy.profileId,
                    stackId: findProjectTrophy.stackId,
                    groupId: findProjectTrophy.groupId,
                    trophyId: findProjectTrophy.trophyId,
                  },
                },
                data: { points },
              }),
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

      if (Number(points) !== Number(findProjectTrophy.points)) {
        return {
          data: {
            projectTrophy: await prisma.projectTrophy.update({
              where: {
                profileId_stackId_groupId_trophyId: {
                  profileId: findProjectTrophy.profileId,
                  stackId: findProjectTrophy.stackId,
                  groupId: findProjectTrophy.groupId,
                  trophyId: findProjectTrophy.trophyId,
                },
              },
              data: { points },
            }),
            stackTrophy: stackTrophy,
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

    if (
      Number(stackTrophyData.psnRate) !== Number(stackTrophy.psnRate) ||
      Number(stackTrophyData.value) !== Number(stackTrophy.value)
    ) {
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
