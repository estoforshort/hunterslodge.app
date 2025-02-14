import dayjs from "dayjs";

export const runAutoQueue = async () => {
  try {
    const [appSettings, profiles] = await Promise.all([
      prisma.appSettings.findUniqueOrThrow({
        select: { updatesEnabled: true },
        where: { appId: "app" },
      }),
      prisma.profile.findMany({
        select: {
          id: true,
          userId: true,
          accountId: true,
          imageUrl: true,
          downloaded: true,
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
          lastFullUpdateAt: true,
          profilesCount: true,
        },
        orderBy: {
          id: "asc",
        },
      }),
    ]);

    if (!appSettings.updatesEnabled) {
      return false;
    }

    for (let p = 0, pl = profiles.length; p < pl; p++) {
      const profile = profiles[p];

      if (dayjs().isAfter(dayjs(profile.lastFullUpdateAt).add(7, "days"))) {
        if (
          profile.userId ||
          dayjs().isAfter(dayjs(profile.lastFullUpdateAt).add(28, "days"))
        ) {
          const [hasQueuedUpdate, initialUpdate] = await Promise.all([
            prisma.update.count({
              where: {
                OR: [
                  {
                    profileId: profile.id,
                    status: "WAITING",
                  },
                  {
                    profileId: profile.id,
                    status: "RUNNING",
                  },
                ],
              },
            }),
            prisma.update.findFirst({
              select: {
                id: true,
                status: true,
              },
              where: {
                profileId: profile.id,
                type: "INITIAL",
              },
            }),
          ]);

          if (
            !hasQueuedUpdate &&
            initialUpdate &&
            initialUpdate.status === "SUCCESSFUL"
          ) {
            const psnProfile = await psn.profile({
              accountId: profile.accountId,
            });

            if (psnProfile.data) {
              const findAvatar = psnProfile.data.profile.avatars.find(
                (a) => a.size === "l",
              );

              await prisma.profile.update({
                where: { id: profile.id },
                data: {
                  onlineId: psnProfile.data.profile.onlineId,
                  imageUrl: findAvatar?.url ?? undefined,
                  platinum:
                    psnProfile.data.trophySummary.earnedTrophies.platinum,
                  gold: psnProfile.data.trophySummary.earnedTrophies.gold,
                  silver: psnProfile.data.trophySummary.earnedTrophies.silver,
                  bronze: psnProfile.data.trophySummary.earnedTrophies.bronze,
                  lastCheckedAt: dayjs().format(),
                  profilesCount: profiles.length,
                },
              });

              if (findAvatar) {
                if (
                  !profile.downloaded ||
                  findAvatar.url !== profile.imageUrl
                ) {
                  try {
                    const fetchImage = await fetch(findAvatar.url);

                    if (fetchImage.ok) {
                      const image = new Uint8Array(
                        await fetchImage.arrayBuffer(),
                      );

                      await useStorage("images").setItemRaw(
                        `profiles/${profile.id}`,
                        image,
                      );

                      await prisma.profile.update({
                        data: {
                          downloaded: true,
                        },
                        where: {
                          id: profile.id,
                        },
                      });
                    }
                  } catch (e) {
                    await prisma.profile.update({
                      data: {
                        downloaded: false,
                      },
                      where: {
                        id: profile.id,
                      },
                    });

                    console.error(e);
                  }
                }
              }

              const createUpdate = await prisma.update.create({
                data: {
                  profileId: profile.id,
                  status: "WAITING",
                  type: "AUTOMATIC",
                  fullUpdate: true,
                  startedProjectsFrom: profile.startedProjects,
                  completedProjectsFrom: profile.completedProjects,
                  definedPlatinumFrom: profile.definedPlatinum,
                  definedGoldFrom: profile.definedGold,
                  definedSilverFrom: profile.definedSilver,
                  definedBronzeFrom: profile.definedBronze,
                  earnedPlatinumFrom: profile.earnedPlatinum,
                  earnedGoldFrom: profile.earnedGold,
                  earnedSilverFrom: profile.earnedSilver,
                  earnedBronzeFrom: profile.earnedBronze,
                  streamPlatinumFrom: profile.streamPlatinum,
                  streamGoldFrom: profile.streamGold,
                  streamSilverFrom: profile.streamSilver,
                  streamBronzeFrom: profile.streamBronze,
                  hiddenTrophiesFrom: profile.hiddenTrophies,
                  completionFrom: profile.completion,
                  pointsFrom: profile.points,
                  streamPointsFrom: profile.streamPoints,
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

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
