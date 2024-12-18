import { z } from "zod";

export default defineCachedEventHandler(
  async (event) => {
    const paramsSchema = z.object({
      profile: z.number({ coerce: true }).positive().int().max(65535),
      project: z.string().min(1).max(36),
    });

    const params = await getValidatedRouterParams(event, paramsSchema.parse);

    const data = await prisma.project.findUnique({
      select: {
        stack: {
          select: {
            id: true,
            game: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                platforms: {
                  select: {
                    platformId: true,
                  },
                },
              },
            },
            definedPlatinum: true,
            definedGold: true,
            definedSilver: true,
            definedBronze: true,
            firstTrophyEarnedAt: true,
            lastTrophyEarnedAt: true,
            quality: true,
            timesStarted: true,
            rarity: true,
            timesCompleted: true,
            avgProgress: true,
            value: true,
          },
        },
        earnedPlatinum: true,
        earnedGold: true,
        earnedSilver: true,
        earnedBronze: true,
        streamPlatinum: true,
        streamGold: true,
        streamSilver: true,
        streamBronze: true,
        firstTrophyEarnedAt: true,
        lastTrophyEarnedAt: true,
        progress: true,
        points: true,
        streamPoints: true,
        timeStreamed: true,
      },
      where: {
        profileId_stackId: {
          profileId: params.profile,
          stackId: params.project,
        },
      },
    });

    return { data };
  },
  { maxAge: 60 },
);
