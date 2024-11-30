import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.number({ coerce: true }).positive().int().max(65535),
    group: z.string().length(3),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.group.findUnique({
    select: {
      id: true,
      name: true,
      imageUrl: true,
      definedPlatinum: true,
      definedGold: true,
      definedSilver: true,
      definedBronze: true,
      createdAt: true,
    },
    where: {
      gameId_id: {
        gameId: params.game,
        id: params.group,
      },
    },
  });

  return { data };
});
