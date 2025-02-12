import fetch from "node-fetch";
import Fuse from "fuse.js";
import dayjs from "dayjs";
import { z } from "zod";

export default defineCachedEventHandler(
  async (event) => {
    const paramsSchema = z.object({
      overlay: z.string().length(36),
    });

    const params = await getValidatedRouterParams(event, paramsSchema.parse);

    const [appSettings, findOverlay] = await Promise.all([
      prisma.appSettings.findUniqueOrThrow({
        select: { updatesEnabled: true },
        where: { appId: "app" },
      }),
      prisma.overlay.findUnique({
        select: {
          id: true,
          profile: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  username: true,
                  displayName: true,
                },
              },
              accountId: true,
              onlineId: true,
              imageUrl: true,
              downloaded: true,
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
              streamPlatinum: true,
              streamGold: true,
              streamSilver: true,
              streamBronze: true,
              hiddenTrophies: true,
              completion: true,
              points: true,
              streamPoints: true,
              timeStreamed: true,
              lastFullUpdateAt: true,
              profilesCount: true,
              streamPosition: true,
            },
          },
          project: {
            select: {
              stackId: true,
              stack: {
                select: {
                  gameId: true,
                  definedPlatinum: true,
                  definedGold: true,
                  definedSilver: true,
                  definedBronze: true,
                  value: true,
                },
              },
              earnedPlatinum: true,
              earnedGold: true,
              earnedSilver: true,
              earnedBronze: true,
              progress: true,
              points: true,
              timeStreamed: true,
            },
          },
          style: true,
          lastLiveAt: true,
          updateProject: true,
          updateTrophies: true,
        },
        where: { id: params.overlay },
      }),
    ]);

    if (!findOverlay || !findOverlay.profile.userId) {
      return {
        data: null,
      };
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
            endsAt: dayjs().add(1, "minute").format(),
            createdAt: dayjs(twitchStream.startDate).format(),
          },
        });
      };

      const stream = await getStream();

      let streamTime = stream.timeStreamed;
      let totalStreamTime = findOverlay.profile.timeStreamed;

      const timeSinceLastStreamUpdate =
        dayjs().unix() - dayjs(stream.updatedAt).unix();

      if (timeSinceLastStreamUpdate < 60) {
        streamTime += timeSinceLastStreamUpdate;
        totalStreamTime += timeSinceLastStreamUpdate;
      }

      await Promise.all([
        prisma.stream.update({
          data: {
            timeStreamed: streamTime,
            endsAt: dayjs().add(1, "minute").format(),
          },
          where: { id: stream.id },
        }),
        prisma.profile.update({
          where: { id: findOverlay.profile.id },
          data: { timeStreamed: totalStreamTime },
        }),
      ]);

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
              stackId: findOverlay.project.stackId,
            },
          },
        });

        if (findStreamOnProject) {
          let sessionTime = findStreamOnProject.timeStreamed;
          let projectStreamTime = findOverlay.project.timeStreamed;

          const timeSinceLastUpdate =
            dayjs().unix() - dayjs(findStreamOnProject.updatedAt).unix();

          if (timeSinceLastUpdate < 60) {
            sessionTime += timeSinceLastUpdate;
            projectStreamTime += timeSinceLastUpdate;
          }

          await Promise.all([
            prisma.streamsOnProjects.update({
              where: {
                streamId_profileId_stackId: {
                  streamId: findStreamOnProject.streamId,
                  profileId: findStreamOnProject.profileId,
                  stackId: findStreamOnProject.stackId,
                },
              },
              data: { timeStreamed: sessionTime },
            }),
            prisma.project.update({
              where: {
                profileId_stackId: {
                  profileId: findOverlay.profile.id,
                  stackId: findOverlay.project.stackId,
                },
              },
              data: { timeStreamed: projectStreamTime },
            }),
          ]);
        } else {
          await prisma.streamsOnProjects.create({
            data: {
              streamId: stream.id,
              profileId: findOverlay.profile.id,
              stackId: findOverlay.project.stackId,
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
              if (findOverlay.project.stackId !== results[0].item.stackId) {
                await prisma.project.update({
                  where: {
                    profileId_stackId: {
                      profileId: findOverlay.profile.id,
                      stackId: findOverlay.project.stackId,
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
                    stackId: findOverlay.project.stackId,
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
                  stackId: findOverlay.project.stackId,
                },
              },
              data: {
                overlayId: null,
              },
            });
          }
        }
      }

      if (appSettings.updatesEnabled && findOverlay.updateTrophies) {
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

              const profilesCount = await prisma.profile.count();

              await prisma.profile.update({
                where: { id: findOverlay.profile.id },
                data: {
                  onlineId: psnProfile.data.profile.onlineId,
                  imageUrl: findAvatar?.url ?? undefined,
                  platinum:
                    psnProfile.data.trophySummary.earnedTrophies.platinum,
                  gold: psnProfile.data.trophySummary.earnedTrophies.gold,
                  silver: psnProfile.data.trophySummary.earnedTrophies.silver,
                  bronze: psnProfile.data.trophySummary.earnedTrophies.bronze,
                  lastCheckedAt: dayjs().format(),
                  profilesCount,
                },
              });

              if (findAvatar) {
                if (
                  !findOverlay.profile.downloaded ||
                  findAvatar.url !== findOverlay.profile.imageUrl
                ) {
                  try {
                    const fetchImage = await fetch(findAvatar.url);

                    if (fetchImage.ok) {
                      const image = new Uint8Array(
                        await fetchImage.arrayBuffer(),
                      );

                      await useStorage("images").setItemRaw(
                        `profiles/${findOverlay.profile.id}`,
                        image,
                      );

                      await prisma.profile.update({
                        data: {
                          downloaded: true,
                        },
                        where: {
                          id: findOverlay.profile.id,
                        },
                      });
                    }
                  } catch (e) {
                    await prisma.profile.update({
                      data: {
                        downloaded: false,
                      },
                      where: {
                        id: findOverlay.profile.id,
                      },
                    });

                    console.error(e);
                  }
                }
              }

              if (
                findOverlay.profile.platinum !==
                  psnProfile.data.trophySummary.earnedTrophies.platinum ||
                findOverlay.profile.gold !==
                  psnProfile.data.trophySummary.earnedTrophies.gold ||
                findOverlay.profile.silver !==
                  psnProfile.data.trophySummary.earnedTrophies.silver ||
                findOverlay.profile.bronze !==
                  psnProfile.data.trophySummary.earnedTrophies.bronze ||
                findOverlay.profile.profilesCount !== profilesCount
              ) {
                const createUpdate = await prisma.update.create({
                  data: {
                    appId: "app",
                    profileId: findOverlay.profile.id,
                    status: "WAITING",
                    type: "OVERLAY",
                    fullUpdate: dayjs().isAfter(
                      dayjs(findOverlay.profile.lastFullUpdateAt).add(
                        3,
                        "hours",
                      ),
                    )
                      ? true
                      : findOverlay.profile.profilesCount !== profilesCount
                        ? true
                        : false,
                    startedProjectsFrom: findOverlay.profile.startedProjects,
                    completedProjectsFrom:
                      findOverlay.profile.completedProjects,
                    definedPlatinumFrom: findOverlay.profile.definedPlatinum,
                    definedGoldFrom: findOverlay.profile.definedGold,
                    definedSilverFrom: findOverlay.profile.definedSilver,
                    definedBronzeFrom: findOverlay.profile.definedBronze,
                    earnedPlatinumFrom: findOverlay.profile.earnedPlatinum,
                    earnedGoldFrom: findOverlay.profile.earnedGold,
                    earnedSilverFrom: findOverlay.profile.earnedSilver,
                    earnedBronzeFrom: findOverlay.profile.earnedBronze,
                    streamPlatinumFrom: findOverlay.profile.streamPlatinum,
                    streamGoldFrom: findOverlay.profile.streamGold,
                    streamSilverFrom: findOverlay.profile.streamSilver,
                    streamBronzeFrom: findOverlay.profile.streamBronze,
                    hiddenTrophiesFrom: findOverlay.profile.hiddenTrophies,
                    completionFrom: findOverlay.profile.completion,
                    pointsFrom: findOverlay.profile.points,
                    streamPointsFrom: findOverlay.profile.streamPoints,
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
      }

      await prisma.overlay.update({
        where: { id: findOverlay.id },
        data: {
          lastLiveAt: dayjs().format(),
        },
      });
    }

    return {
      data: findOverlay,
    };
  },
  { maxAge: 10 },
);
