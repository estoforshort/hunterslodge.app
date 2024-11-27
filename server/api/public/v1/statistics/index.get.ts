export default defineCachedEventHandler(
  async () => {
    const data = await prisma.app.findUnique({
      select: {
        _count: {
          select: {
            users: true,
            profileRegions: true,
            profiles: true,
            overlays: true,
            streams: true,
            updates: true,
            games: true,
            platforms: true,
            groups: true,
            trophies: true,
            stacks: true,
            stackGroups: true,
            stackTrophies: true,
            projects: true,
            earnedTrophies: true,
          },
        },
      },
      where: { id: "app" },
    });

    return { data: data?._count ?? null };
  },
  { maxAge: 900 },
);
