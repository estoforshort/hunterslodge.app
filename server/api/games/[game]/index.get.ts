import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stack.findUnique({
    select: {
      id: true,
      game: {
        select: {
          name: true,
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
      timesCompleted: true,
      avgProgress: true,
      value: true,
      createdAt: true,
      updatedAt: true,
    },
    where: { id: params.game },
  });

  return { data };
});
