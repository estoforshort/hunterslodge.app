import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    stack: z.string().min(1).max(36),
    group: z.string().length(3),
    trophy: z.number({ coerce: true }).positive().int().max(65535),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stackTrophy.findUnique({
    select: {
      trophyId: true,
      gameTrophy: {
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
        },
      },
      firstEarnedAt: true,
      lastEarnedAt: true,
      quality: true,
      timesEarned: true,
      rarity: true,
      value: true,
      createdAt: true,
    },
    where: {
      stackId_groupId_trophyId: {
        stackId: params.stack,
        groupId: params.group,
        trophyId: params.trophy,
      },
    },
  });

  return { data };
});
