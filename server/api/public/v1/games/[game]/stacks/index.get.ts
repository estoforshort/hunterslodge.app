import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.number({ coerce: true }).positive().int().max(65535),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.game.findUnique({
    select: {
      stacks: {
        select: {
          id: true,
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
        orderBy: { createdAt: "asc" },
      },
    },
    where: { id: params.game },
  });

  return { data: data?.stacks ?? [] };
});
