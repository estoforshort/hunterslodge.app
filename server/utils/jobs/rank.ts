export const runRankings = async () => {
  try {
    const [regions, profiles] = await Promise.all([
      prisma.profileRegion.findMany({
        select: {
          id: true,
          points: true,
          position: true,
        },
        orderBy: {
          points: "desc",
        },
      }),
      prisma.profile.findMany({
        select: {
          id: true,
          gloabalPosition: true,
          summary: {
            select: {
              hiddenTrophies: true,
              points: true,
            },
          },
        },
        where: {
          summary: {
            lastFullUpdateAt: { not: null },
          },
        },
        orderBy: {
          summary: {
            points: "desc",
          },
        },
      }),
    ]);

    let regionPosition = 1;

    for (let r = 0, rl = regions.length; r < rl; r++) {
      const region = regions[r];

      if (region.position !== regionPosition) {
        await prisma.profileRegion.update({
          where: {
            id: region.id,
          },
          data: {
            position: regionPosition,
            positionChanges: {
              create: {
                positionFrom: region.position,
                positionTo: regionPosition,
              },
            },
          },
        });
      }

      regionPosition += 1;
    }

    let profileGlobalPosition = 1;

    for (let p = 0, pl = profiles.length; p < pl; p++) {
      const profile = profiles[p];

      if (profile.summary) {
        if (!profile.summary.hiddenTrophies) {
          if (profile.gloabalPosition !== profileGlobalPosition) {
            await prisma.profile.update({
              where: { id: profile.id },
              data: {
                gloabalPosition: profileGlobalPosition,
                globalPositionChanges: {
                  create: {
                    globalPositionFrom: profile.gloabalPosition,
                    globalPositionTo: profileGlobalPosition,
                  },
                },
              },
            });
          }

          profileGlobalPosition += 1;
        } else {
          if (profile.gloabalPosition) {
            await prisma.profile.update({
              where: { id: profile.id },
              data: {
                gloabalPosition: 0,
                globalPositionChanges: {
                  create: {
                    globalPositionFrom: profile.gloabalPosition,
                    globalPositionTo: 0,
                  },
                },
              },
            });
          }
        }
      }
    }

    return;
  } catch (e) {
    console.error(e);
    return;
  }
};
