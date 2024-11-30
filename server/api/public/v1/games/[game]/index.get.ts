import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.number({ coerce: true }).positive().int().max(65535),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.game.findUnique({
    select: {
      id: true,
      name: true,
      imageUrl: true,
      definedPlatinum: true,
      definedGold: true,
      definedSilver: true,
      definedBronze: true,
      createdAt: true,
      platforms: {
        select: {
          platformId: true,
        },
      },
    },
    where: { id: params.game },
  });

  return { data };
});
