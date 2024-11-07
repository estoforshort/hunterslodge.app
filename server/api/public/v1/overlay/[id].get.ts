import Fuse from "fuse.js";
import dayjs from "dayjs";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    id: z.string().length(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const findOverlay = await prisma.overlay.findUnique({
    select: {
      id: true,
      profile: {
        select: {
          id: true,
          userId: true,
          accountId: true,
          onlineId: true,
          imageUrl: true,
          platinum: true,
          gold: true,
          silver: true,
          bronze: true,
          lastCheckedAt: true,
          startedProjects: true,
          completedProjects: true,
          definedPlatinum: true,
          definedGold: true,
          definedSilver: true,
          definedBronze: true,
          earnedPlatinum: true,
          earnedGold: true,
          earnedSilver: true,
          earnedBronze: true,
          hiddenTrophies: true,
          completion: true,
          points: true,
          lastFullUpdateAt: true,
        },
      },
      project: {
        select: {
          stack: {
            select: {
              id: true,
              game: {
                select: {
                  imageUrl: true,
                },
              },
              definedPlatinum: true,
              definedGold: true,
              definedSilver: true,
              definedBronze: true,
            },
          },
          earnedPlatinum: true,
          earnedGold: true,
          earnedSilver: true,
          earnedBronze: true,
          progress: true,
          streams: {
            select: {
              timeStreamed: true,
            },
          },
        },
      },
      viewers: true,
      lastLiveAt: true,
      updateProject: true,
      updateTrophies: true,
    },
    where: { id: params.id },
  });

  if (!findOverlay) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
    });
  }

  const twitchStream = await twitch.streams.getStreamByUserId(
    findOverlay.profile.userId,
  );

  if (twitchStream) {
    const getStream = async () => {
      const findStream = await prisma.stream.findUnique({
        where: { id: twitchStream.id },
      });

      if (findStream) return findStream;

      return await prisma.stream.create({
        data: {
          id: twitchStream.id,
          profileId: findOverlay.profile.id,
          maxViewers: 0,
          avgViewers: 0,
          endsAt: dayjs().add(1, "minute").format(),
          createdAt: dayjs(twitchStream.startDate).format(),
        },
      });
    };

    const stream = await getStream();

    if (
      dayjs(findOverlay.lastLiveAt).isBefore(stream.createdAt) ||
      findOverlay.viewers !== twitchStream.viewers
    ) {
      await prisma.viewers.create({
        data: {
          streamId: stream.id,
          viewers: twitchStream.viewers,
        },
      });
    }

    const streamViewers = await prisma.viewers.aggregate({
      _avg: {
        viewers: true,
      },
      where: {
        streamId: stream.id,
      },
    });

    await prisma.stream.update({
      data: {
        maxViewers:
          twitchStream.viewers > stream.maxViewers
            ? twitchStream.viewers
            : stream.maxViewers,
        avgViewers: streamViewers._avg.viewers ?? 0,
        endsAt: dayjs().add(1, "minute").format(),
      },
      where: { id: stream.id },
    });

    if (findOverlay.project) {
      const findStreamOnProject = await prisma.streamsOnProjects.findUnique({
        select: {
          streamId: true,
          profileId: true,
          stackId: true,
          timeStreamed: true,
          updatedAt: true,
        },
        where: {
          streamId_profileId_stackId: {
            streamId: stream.id,
            profileId: findOverlay.profile.id,
            stackId: findOverlay.project.stack.id,
          },
        },
      });

      if (findStreamOnProject) {
        let timeStreamed = findStreamOnProject.timeStreamed;

        const timeSinceLastUpdate =
          dayjs().unix() - dayjs(findStreamOnProject.updatedAt).unix();

        if (timeSinceLastUpdate < 60) {
          timeStreamed += timeSinceLastUpdate;
        }

        await prisma.streamsOnProjects.update({
          where: {
            streamId_profileId_stackId: {
              streamId: findStreamOnProject.streamId,
              profileId: findStreamOnProject.profileId,
              stackId: findStreamOnProject.stackId,
            },
          },
          data: { timeStreamed },
        });
      } else {
        await prisma.streamsOnProjects.create({
          data: {
            streamId: stream.id,
            profileId: findOverlay.profile.id,
            stackId: findOverlay.project.stack.id,
            timeStreamed: 0,
          },
        });
      }
    }

    if (findOverlay.updateProject) {
      if (twitchStream.gameName) {
        const findProjects = await prisma.project.findMany({
          select: {
            stackId: true,
            stack: {
              select: {
                game: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          where: {
            profileId: findOverlay.profile.id,
            stack: {
              game: {
                name: {
                  search: twitchStream.gameName,
                },
              },
            },
          },
          orderBy: {
            lastTrophyEarnedAt: "desc",
          },
        });

        const fuse = new Fuse(findProjects, {
          keys: ["stack.game.name"],
          threshold: 0.2,
        });

        const results = fuse.search(twitchStream.gameName);

        if (results[0]) {
          if (!findOverlay.project) {
            await prisma.project.update({
              where: {
                profileId_stackId: {
                  profileId: findOverlay.profile.id,
                  stackId: results[0].item.stackId,
                },
              },
              data: {
                overlayId: findOverlay.id,
              },
            });
          } else {
            if (findOverlay.project.stack.id !== results[0].item.stackId) {
              await prisma.project.update({
                where: {
                  profileId_stackId: {
                    profileId: findOverlay.profile.id,
                    stackId: findOverlay.project.stack.id,
                  },
                },
                data: {
                  overlayId: null,
                },
              });

              await prisma.project.update({
                where: {
                  profileId_stackId: {
                    profileId: findOverlay.profile.id,
                    stackId: results[0].item.stackId,
                  },
                },
                data: {
                  overlayId: findOverlay.id,
                },
              });
            }
          }
        } else {
          if (findOverlay.project) {
            await prisma.project.update({
              where: {
                profileId_stackId: {
                  profileId: findOverlay.profile.id,
                  stackId: findOverlay.project.stack.id,
                },
              },
              data: {
                overlayId: null,
              },
            });
          }
        }
      } else {
        if (findOverlay.project) {
          await prisma.project.update({
            where: {
              profileId_stackId: {
                profileId: findOverlay.profile.id,
                stackId: findOverlay.project.stack.id,
              },
            },
            data: {
              overlayId: null,
            },
          });
        }
      }
    }

    if (findOverlay.updateTrophies) {
      if (
        dayjs().isAfter(
          dayjs(findOverlay.profile.lastCheckedAt).add(5, "minutes"),
        )
      ) {
        const hasQueuedUpdate = await prisma.update.count({
          where: {
            OR: [
              {
                profileId: findOverlay.profile.id,
                status: "WAITING",
              },
              {
                profileId: findOverlay.profile.id,
                status: "RUNNING",
              },
            ],
          },
        });

        if (!hasQueuedUpdate) {
          const psnProfile = await psn.profile({
            accountId: findOverlay.profile.accountId,
          });

          if (psnProfile.data) {
            const findAvatar = psnProfile.data.profile.avatars.find(
              (a) => a.size === "l",
            );

            await prisma.profile.update({
              where: { id: findOverlay.profile.id },
              data: {
                onlineId: psnProfile.data.profile.onlineId,
                imageUrl: findAvatar?.url ?? undefined,
                platinum: psnProfile.data.trophySummary.earnedTrophies.platinum,
                gold: psnProfile.data.trophySummary.earnedTrophies.gold,
                silver: psnProfile.data.trophySummary.earnedTrophies.silver,
                bronze: psnProfile.data.trophySummary.earnedTrophies.bronze,
                lastCheckedAt: dayjs().format(),
              },
            });

            if (findAvatar && findAvatar.url !== findOverlay.profile.imageUrl) {
              try {
                const fetchImage = await fetch(findAvatar.url);

                if (fetchImage.ok) {
                  const image = Buffer.from(await fetchImage.arrayBuffer());

                  await prisma.profileImage.update({
                    where: {
                      profileId: findOverlay.profile.id,
                    },
                    data: { image },
                  });
                }
              } catch (e) {
                console.error(e);
              }
            }

            const createUpdate = await prisma.update.create({
              data: {
                appId: "app",
                profileId: findOverlay.profile.id,
                status: "WAITING",
                type: "AUTOMATIC",
                fullUpdate: dayjs().isAfter(
                  dayjs(findOverlay.profile.lastFullUpdateAt).add(3, "hours"),
                ),
                startedProjectsFrom: findOverlay.profile.startedProjects,
                completedProjectsFrom: findOverlay.profile.completedProjects,
                definedPlatinumFrom: findOverlay.profile.definedPlatinum,
                definedGoldFrom: findOverlay.profile.definedGold,
                definedSilverFrom: findOverlay.profile.definedSilver,
                definedBronzeFrom: findOverlay.profile.definedBronze,
                earnedPlatinumFrom: findOverlay.profile.earnedPlatinum,
                earnedGoldFrom: findOverlay.profile.earnedGold,
                earnedSilverFrom: findOverlay.profile.earnedSilver,
                earnedBronzeFrom: findOverlay.profile.earnedBronze,
                hiddenTrophiesFrom: findOverlay.profile.hiddenTrophies,
                completionFrom: findOverlay.profile.completion,
                pointsFrom: findOverlay.profile.points,
              },
            });

            await addJob({
              type: "UPDATE",
              update: { id: createUpdate.id, type: createUpdate.type },
            });
          }
        }
      }
    }

    await prisma.overlay.update({
      where: { id: findOverlay.id },
      data: {
        viewers: twitchStream.viewers,
        mature: twitchStream.isMature,
        language: twitchStream.language,
        lastLiveAt: dayjs().format(),
      },
    });
  }

  return {
    data: findOverlay,
  };
});
