import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.number({ coerce: true }).positive().int().max(65535),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.game.findUnique({
    select: {
      groups: {
        select: {
          gameId: true,
          id: true,
          name: true,
          imageUrl: true,
          definedPlatinum: true,
          definedGold: true,
          definedSilver: true,
          definedBronze: true,
          createdAt: true,
        },
        orderBy: { id: "asc" },
      },
    },
    where: { id: params.game },
  });

  return { data: data?.groups ?? [] };
});
