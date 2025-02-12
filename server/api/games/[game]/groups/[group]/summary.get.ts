import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.string().min(1).max(36),
    group: z.string().length(3),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stackGroup.findUnique({
    select: {
      stackId: true,
      gameId: true,
      groupId: true,
      gameGroup: {
        select: {
          name: true,
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
      createdAt: true,
      updatedAt: true,
    },
    where: {
      stackId_groupId: {
        stackId: params.game,
        groupId: params.group,
      },
    },
  });

  return { data };
});
