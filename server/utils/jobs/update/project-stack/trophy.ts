import dayjs from "dayjs";

import type { Prisma, TrophyType } from "@prisma/client";

type Data = {
  updateId: number;
  stackChangeId: string;
  profilesCount: number;
  profile: {
    id: number;
    createdAt: Date;
  };
  gameId: number;
  groupId: string;
  stackId: string;
  trophy: {
    trophyId: number;
    earned: boolean;
    earnedDateTime: string | Date | null | undefined;
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
            stackId: data.stackId,
            groupId: data.groupId,
            trophyId: data.trophy.trophyId,
          },
        },
      });

      if (findStackTrophy) return findStackTrophy;

      return await prisma.stackTrophy.create({
        data: {
          stackId: data.stackId,
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
            profileId: data.profile.id,
            stackId: data.stackId,
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
      psnRate: data.trophy.trophyEarnedRate,
      quality: (Math.round(
        (100 - Number(data.trophy.trophyEarnedRate) + Number.EPSILON) * 100,
      ) / 100) as unknown as Prisma.Decimal,
      timesEarned: stackTrophy.timesEarned,
      rarity: stackTrophy.rarity,
      value: stackTrophy.value,
    };

    if (data.trophy.earned && !findProjectTrophy) {
      stackTrophyData.timesEarned += 1;
    }

    if (stackTrophyData.timesEarned) {
      stackTrophyData.rarity = (Math.round(
        (data.profilesCount / stackTrophyData.timesEarned + Number.EPSILON) *
          100,
      ) / 100) as unknown as Prisma.Decimal;
    } else {
      stackTrophyData.rarity = data.profilesCount as unknown as Prisma.Decimal;
    }

    switch (data.trophy.trophyType) {
      case "platinum": {
        stackTrophyData.value = (Math.round(
          ((Number(stackTrophyData.quality) / 100) * 300 + Number.EPSILON) *
            100,
        ) / 100) as unknown as Prisma.Decimal;
        break;
      }

      case "gold": {
        stackTrophyData.value = (Math.round(
          ((Number(stackTrophyData.quality) / 100) * 90 + Number.EPSILON) * 100,
        ) / 100) as unknown as Prisma.Decimal;
        break;
      }

      case "silver": {
        stackTrophyData.value = (Math.round(
          ((Number(stackTrophyData.quality) / 100) * 30 + Number.EPSILON) * 100,
        ) / 100) as unknown as Prisma.Decimal;
        break;
      }

      case "bronze": {
        stackTrophyData.value = (Math.round(
          ((Number(stackTrophyData.quality) / 100) * 15 + Number.EPSILON) * 100,
        ) / 100) as unknown as Prisma.Decimal;
        break;
      }
    }

    const valueMultiplier = (Math.round(
      ((Number(stackTrophyData.quality) / 100) *
        Number(stackTrophyData.rarity) +
        Number.EPSILON) *
        100,
    ) / 100) as unknown as Prisma.Decimal;

    stackTrophyData.value = (Math.round(
      (Number(valueMultiplier) * Number(stackTrophyData.value) +
        Number.EPSILON) *
        100,
    ) / 100) as unknown as Prisma.Decimal;

    let streamTrophy = false;
    let streamId = null;

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

          if (
            dayjs(data.trophy.earnedDateTime).isAfter(data.profile.createdAt)
          ) {
            const findStream = await prisma.stream.findFirst({
              select: {
                id: true,
              },
              where: {
                profileId: data.profile.id,
                createdAt: { lt: dayjs(data.trophy.earnedDateTime).format() },
                endsAt: { gt: dayjs(data.trophy.earnedDateTime).format() },
              },
            });

            if (findStream) {
              streamTrophy = true;
              streamId = findStream.id;
            }
          }
        }

        const [createProjectTrophy, updateStackTrophy] = await Promise.all([
          prisma.projectTrophy.create({
            data: {
              profileId: data.profile.id,
              stackId: data.stackId,
              groupId: data.groupId,
              trophyId: data.trophy.trophyId,
              appId: "app",
              streamId,
              earnedAt: data.trophy.earnedDateTime
                ? dayjs(data.trophy.earnedDateTime).format()
                : null,
              points: stackTrophyData.value,
              changes: {
                create: {
                  updateId: data.updateId,
                  pointsFrom: 0,
                  pointsTo: stackTrophyData.value,
                },
              },
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
            data: {
              ...stackTrophyData,
              changes: {
                create: {
                  stackChangeId: data.stackChangeId,
                  psnRateFrom: stackTrophy.psnRate,
                  psnRateTo: stackTrophyData.psnRate,
                  qualityFrom: stackTrophy.quality,
                  qualityTo: stackTrophyData.quality,
                  timesEarnedFrom: stackTrophy.timesEarned,
                  timesEarnedTo: stackTrophyData.timesEarned,
                  rarityFrom: stackTrophy.rarity,
                  rarityTo: stackTrophyData.rarity,
                  valueFrom: stackTrophy.value,
                  valueTo: stackTrophyData.value,
                },
              },
            },
          }),
        ]);

        return {
          data: {
            projectTrophy: createProjectTrophy,
            stackTrophy: updateStackTrophy,
            streamTrophy,
            streamId,
          },
        };
      }

      if (findProjectTrophy.streamId) {
        streamTrophy = true;
      }

      if (
        Number(stackTrophyData.quality) !== Number(stackTrophy.quality) ||
        stackTrophyData.timesEarned !== stackTrophy.timesEarned ||
        Number(stackTrophyData.rarity) !== Number(stackTrophy.rarity) ||
        Number(stackTrophyData.value) !== Number(stackTrophy.value)
      ) {
        if (
          Number(stackTrophyData.value) !== Number(findProjectTrophy.points)
        ) {
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
                data: {
                  points: stackTrophyData.value,
                  changes: {
                    create: {
                      updateId: data.updateId,
                      pointsFrom: findProjectTrophy.points,
                      pointsTo: stackTrophyData.value,
                    },
                  },
                },
              }),
              stackTrophy: await prisma.stackTrophy.update({
                where: {
                  stackId_groupId_trophyId: {
                    stackId: stackTrophy.stackId,
                    groupId: stackTrophy.groupId,
                    trophyId: stackTrophy.trophyId,
                  },
                },
                data: {
                  ...stackTrophyData,
                  changes: {
                    create: {
                      stackChangeId: data.stackChangeId,
                      psnRateFrom: stackTrophy.psnRate,
                      psnRateTo: stackTrophyData.psnRate,
                      qualityFrom: stackTrophy.quality,
                      qualityTo: stackTrophyData.quality,
                      timesEarnedFrom: stackTrophy.timesEarned,
                      timesEarnedTo: stackTrophyData.timesEarned,
                      rarityFrom: stackTrophy.rarity,
                      rarityTo: stackTrophyData.rarity,
                      valueFrom: stackTrophy.value,
                      valueTo: stackTrophyData.value,
                    },
                  },
                },
              }),
              streamTrophy,
              streamId,
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
              data: {
                ...stackTrophyData,
                changes: {
                  create: {
                    stackChangeId: data.stackChangeId,
                    psnRateFrom: stackTrophy.psnRate,
                    psnRateTo: stackTrophyData.psnRate,
                    qualityFrom: stackTrophy.quality,
                    qualityTo: stackTrophyData.quality,
                    timesEarnedFrom: stackTrophy.timesEarned,
                    timesEarnedTo: stackTrophyData.timesEarned,
                    rarityFrom: stackTrophy.rarity,
                    rarityTo: stackTrophyData.rarity,
                    valueFrom: stackTrophy.value,
                    valueTo: stackTrophyData.value,
                  },
                },
              },
            }),
            streamTrophy,
            streamId,
          },
        };
      }

      if (Number(stackTrophyData.value) !== Number(findProjectTrophy.points)) {
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
              data: {
                points: stackTrophyData.value,
                changes: {
                  create: {
                    updateId: data.updateId,
                    pointsFrom: findProjectTrophy.points,
                    pointsTo: stackTrophyData.value,
                  },
                },
              },
            }),
            stackTrophy: stackTrophy,
            streamTrophy,
            streamId,
          },
        };
      }

      return {
        data: {
          projectTrophy: findProjectTrophy,
          stackTrophy: stackTrophy,
          streamTrophy,
          streamId,
        },
      };
    }

    if (
      Number(stackTrophyData.quality) !== Number(stackTrophy.quality) ||
      stackTrophyData.timesEarned !== stackTrophy.timesEarned ||
      Number(stackTrophyData.rarity) !== Number(stackTrophy.rarity) ||
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
            data: {
              ...stackTrophyData,
              changes: {
                create: {
                  stackChangeId: data.stackChangeId,
                  psnRateFrom: stackTrophy.psnRate,
                  psnRateTo: stackTrophyData.psnRate,
                  qualityFrom: stackTrophy.quality,
                  qualityTo: stackTrophyData.quality,
                  timesEarnedFrom: stackTrophy.timesEarned,
                  timesEarnedTo: stackTrophyData.timesEarned,
                  rarityFrom: stackTrophy.rarity,
                  rarityTo: stackTrophyData.rarity,
                  valueFrom: stackTrophy.value,
                  valueTo: stackTrophyData.value,
                },
              },
            },
          }),
          streamTrophy,
          streamId,
        },
      };
    }

    return {
      data: {
        projectTrophy: findProjectTrophy,
        stackTrophy: stackTrophy,
        streamTrophy,
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
