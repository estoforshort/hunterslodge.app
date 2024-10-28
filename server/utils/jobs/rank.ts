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
          hiddenTrophies: true,
          points: true,
          globalPosition: true,
        },
        where: {
          lastFullUpdateAt: { not: null },
        },
        orderBy: {
          points: "desc",
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

      if (!profile.hiddenTrophies) {
        if (profile.globalPosition !== profileGlobalPosition) {
          await prisma.profile.update({
            where: { id: profile.id },
            data: {
              globalPosition: profileGlobalPosition,
              globalPositionChanges: {
                create: {
                  globalPositionFrom: profile.globalPosition,
                  globalPositionTo: profileGlobalPosition,
                },
              },
            },
          });
        }

        profileGlobalPosition += 1;
      } else {
        if (profile.globalPosition) {
          await prisma.profile.update({
            where: { id: profile.id },
            data: {
              globalPosition: 0,
              globalPositionChanges: {
                create: {
                  globalPositionFrom: profile.globalPosition,
                  globalPositionTo: 0,
                },
              },
            },
          });
        }
      }
    }

    return;
  } catch (e) {
    console.error(e);
    return;
  }
};
