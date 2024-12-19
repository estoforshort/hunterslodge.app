import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    stack: z.string().min(1).max(36),
    group: z.string().length(3),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stackGroup.findUnique({
    select: {
      gameId: true,
      groupId: true,
      gameGroup: {
        select: {
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
      createdAt: true,
    },
    where: {
      stackId_groupId: {
        stackId: params.stack,
        groupId: params.group,
      },
    },
  });

  return { data };
});
