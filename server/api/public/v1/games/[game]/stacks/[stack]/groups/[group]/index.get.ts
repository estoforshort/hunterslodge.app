import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.number({ coerce: true }).positive().int().max(65535),
    stack: z.string().min(1).max(36),
    group: z.string().length(3),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stackGroup.findUnique({
    select: {
      groupId: true,
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
