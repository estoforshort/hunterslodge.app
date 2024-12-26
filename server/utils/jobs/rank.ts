import { runAutoQueue } from "./autoQueue";

export const runRankings = async () => {
  try {
    const [regions, profiles, streamers] = await Promise.all([
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
      prisma.profile.findMany({
        select: {
          id: true,
          hiddenTrophies: true,
          streamPoints: true,
          streamPosition: true,
        },
        where: {
          streamPoints: { gt: 0 },
        },
        orderBy: {
          streamPoints: "desc",
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
    }

    let streamPosition = 1;

    for (let s = 0, sl = streamers.length; s < sl; s++) {
      const streamer = streamers[s];

      if (streamer.streamPosition !== streamPosition) {
        await prisma.profile.update({
          where: { id: streamer.id },
          data: {
            streamPosition: streamPosition,
            streamPositionChanges: {
              create: {
                streamPositionFrom: streamer.streamPosition,
                streamPositionTo: streamPosition,
              },
            },
          },
        });
      }

      streamPosition += 1;
    }

    return await runAutoQueue();
  } catch (e) {
    console.error(e);
    return;
  }
};
