export default defineCachedEventHandler(
  async () => {
    const [
      stacks,
      stackTrophies,
      profiles,
      streamers,
      timeStreamed,
      earnedStreamTrophies,
      totalEarnedTrophies,
    ] = await Promise.all([
      prisma.stack.count(),
      prisma.stackTrophy.count(),
      prisma.profile.count({ where: { userId: { not: null } } }),
      prisma.profile.count({ where: { streamPosition: { gt: 0 } } }),
      prisma.profile.aggregate({ _sum: { timeStreamed: true } }),
      prisma.projectTrophy.count({ where: { streamId: { not: null } } }),
      prisma.projectTrophy.count({
        where: { profile: { userId: { not: null } } },
      }),
    ]);

    return {
      data: {
        stacks,
        stackTrophies,
        profiles,
        streamers,
        timeStreamed: timeStreamed._sum.timeStreamed,
        earnedStreamTrophies,
        totalEarnedTrophies,
      },
    };
  },
  { maxAge: 60 },
);
