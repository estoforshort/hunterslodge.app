import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    stack: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stack.findUnique({
    select: {
      id: true,
      gameId: true,
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
      createdAt: true,
    },
    where: { id: params.stack },
  });

  return { data };
});
