import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.number({ coerce: true }).positive().int().max(65535),
    group: z.string().min(3).max(3),
    trophy: z.number({ coerce: true }).int().max(65535),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.trophy.findUnique({
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
    where: {
      gameId_groupId_id: {
        gameId: params.game,
        groupId: params.group,
        id: params.trophy,
      },
    },
  });

  return { data };
});
