import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.number({ coerce: true }).positive().int().max(65535),
    group: z.string().min(3).max(3),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.group.findUnique({
    select: {
      trophies: {
        select: {
          gameId: true,
          groupId: true,
          id: true,
          type: true,
          name: true,
          description: true,
          imageUrl: true,
          createdAt: true,
        },
      },
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
