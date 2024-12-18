import { z } from "zod";

export default defineCachedEventHandler(
  async (event) => {
    const paramsSchema = z.object({
      profile: z.number({ coerce: true }).positive().int().max(65535),
      project: z.string().min(1).max(36),
      group: z.string().min(3).max(3),
    });

    const params = await getValidatedRouterParams(event, paramsSchema.parse);

    const data = await prisma.projectGroup.findUnique({
      select: {
        stackGroup: {
          select: {
            gameGroup: {
              select: {
                gameId: true,
                id: true,
                name: true,
                imageUrl: true,
              },
            },
            definedPlatinum: true,
            definedGold: true,
            definedSilver: true,
            definedBronze: true,
            firstTrophyEarnedAt: true,
            lastTrophyEarnedAt: true,
            quality: true,
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
      },
      where: {
        profileId_stackId_groupId: {
          profileId: params.profile,
          stackId: params.project,
          groupId: params.group,
        },
      },
    });

    return { data };
  },
  { maxAge: 60 },
);
