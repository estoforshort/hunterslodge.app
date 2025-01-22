import dayjs from "dayjs";

import type { TrophyType } from "@prisma/client";

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
  avgTrophyEarnRate: number;
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
      psnRate: Number(data.trophy.trophyEarnedRate),
      quality:
        Math.round(
          (100 - Number(data.trophy.trophyEarnedRate) + Number.EPSILON) * 100,
        ) / 100,
      timesEarned: stackTrophy.timesEarned,
      rarity: Number(stackTrophy.rarity),
      value: Number(stackTrophy.value),
    };

    if (data.avgTrophyEarnRate > 50) {
      const qL = (data.avgTrophyEarnRate / 100) * stackTrophyData.quality;

      stackTrophyData.quality =
        Math.round((stackTrophyData.quality - qL + Number.EPSILON) * 100) / 100;
    } else if (data.avgTrophyEarnRate > 15) {
      const qL = (data.avgTrophyEarnRate / 100) * stackTrophyData.quality;
      const c = 0.5 * qL;

      stackTrophyData.quality =
        Math.round((stackTrophyData.quality - c + Number.EPSILON) * 100) / 100;
    } else if (data.avgTrophyEarnRate > 5) {
      const qL = (data.avgTrophyEarnRate / 100) * stackTrophyData.quality;
      const c = 0.15 * qL;

      stackTrophyData.quality =
        Math.round((stackTrophyData.quality - c + Number.EPSILON) * 100) / 100;
    }

    if (data.trophy.earned && !findProjectTrophy) {
      stackTrophyData.timesEarned += 1;
    }

    if (stackTrophyData.timesEarned) {
      stackTrophyData.rarity =
        Math.round(
          ((stackTrophy.timesEarned / data.profilesCount) * 100 +
            Number.EPSILON) *
            100,
        ) / 100;
    } else {
      stackTrophyData.rarity = 0;
    }

    switch (data.trophy.trophyType) {
      case "platinum": {
        stackTrophyData.value =
          Math.round(
            ((stackTrophyData.quality / 100) * 300 + Number.EPSILON) * 100,
          ) / 100;
        break;
      }

      case "gold": {
        stackTrophyData.value =
          Math.round(
            ((stackTrophyData.quality / 100) * 90 + Number.EPSILON) * 100,
          ) / 100;
        break;
      }

      case "silver": {
        stackTrophyData.value =
          Math.round(
            ((stackTrophyData.quality / 100) * 30 + Number.EPSILON) * 100,
          ) / 100;
        break;
      }

      case "bronze": {
        stackTrophyData.value =
          Math.round(
            ((stackTrophyData.quality / 100) * 15 + Number.EPSILON) * 100,
          ) / 100;
        break;
      }
    }

    const valueMultiplier =
      Math.round((1 - (stackTrophyData.rarity / 100 + Number.EPSILON)) * 100) /
      100;

    stackTrophyData.value =
      Math.round(
        (valueMultiplier * stackTrophyData.value + Number.EPSILON) * 100,
      ) / 100;

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
        stackTrophyData.quality !== Number(stackTrophy.quality) ||
        stackTrophyData.timesEarned !== stackTrophy.timesEarned ||
        stackTrophyData.rarity !== Number(stackTrophy.rarity) ||
        stackTrophyData.value !== Number(stackTrophy.value)
      ) {
        if (stackTrophyData.value !== Number(findProjectTrophy.points)) {
          const [updateProjectTrophy, findProjectTrophyChange] =
            await Promise.all([
              prisma.projectTrophy.update({
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
                },
              }),
              prisma.projectTrophyChange.findUnique({
                where: {
                  updateId_stackId_groupId_trophyId: {
                    updateId: data.updateId,
                    stackId: findProjectTrophy.stackId,
                    groupId: findProjectTrophy.groupId,
                    trophyId: findProjectTrophy.trophyId,
                  },
                },
              }),
            ]);

          if (findProjectTrophyChange) {
            await prisma.projectTrophyChange.update({
              data: {
                pointsFrom: findProjectTrophy.points,
                pointsTo: stackTrophyData.value,
              },
              where: {
                updateId_stackId_groupId_trophyId: {
                  updateId: findProjectTrophyChange.updateId,
                  stackId: findProjectTrophyChange.stackId,
                  groupId: findProjectTrophyChange.groupId,
                  trophyId: findProjectTrophyChange.trophyId,
                },
              },
            });
          } else {
            await prisma.projectTrophyChange.create({
              data: {
                updateId: data.updateId,
                stackId: findProjectTrophy.stackId,
                groupId: findProjectTrophy.groupId,
                profileId: findProjectTrophy.profileId,
                trophyId: findProjectTrophy.trophyId,
                pointsFrom: findProjectTrophy.points,
                pointsTo: stackTrophyData.value,
              },
            });
          }

          return {
            data: {
              projectTrophy: updateProjectTrophy,
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

      if (stackTrophyData.value !== Number(findProjectTrophy.points)) {
        const [updateProjectTrophy, findProjectTrophyChange] =
          await Promise.all([
            prisma.projectTrophy.update({
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
              },
            }),
            prisma.projectTrophyChange.findUnique({
              where: {
                updateId_stackId_groupId_trophyId: {
                  updateId: data.updateId,
                  stackId: findProjectTrophy.stackId,
                  groupId: findProjectTrophy.groupId,
                  trophyId: findProjectTrophy.trophyId,
                },
              },
            }),
          ]);

        if (findProjectTrophyChange) {
          await prisma.projectTrophyChange.update({
            data: {
              pointsFrom: findProjectTrophy.points,
              pointsTo: stackTrophyData.value,
            },
            where: {
              updateId_stackId_groupId_trophyId: {
                updateId: findProjectTrophyChange.updateId,
                stackId: findProjectTrophyChange.stackId,
                groupId: findProjectTrophyChange.groupId,
                trophyId: findProjectTrophyChange.trophyId,
              },
            },
          });
        } else {
          await prisma.projectTrophyChange.create({
            data: {
              updateId: data.updateId,
              stackId: findProjectTrophy.stackId,
              groupId: findProjectTrophy.groupId,
              profileId: findProjectTrophy.profileId,
              trophyId: findProjectTrophy.trophyId,
              pointsFrom: findProjectTrophy.points,
              pointsTo: stackTrophyData.value,
            },
          });
        }

        return {
          data: {
            projectTrophy: updateProjectTrophy,
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
      stackTrophyData.quality !== Number(stackTrophy.quality) ||
      stackTrophyData.timesEarned !== stackTrophy.timesEarned ||
      stackTrophyData.rarity !== Number(stackTrophy.rarity) ||
      stackTrophyData.value !== Number(stackTrophy.value)
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
