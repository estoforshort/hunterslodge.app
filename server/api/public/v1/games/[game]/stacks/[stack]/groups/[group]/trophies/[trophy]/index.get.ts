import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.number({ coerce: true }).positive().int().max(65535),
    stack: z.string().min(1).max(36),
    group: z.string().length(3),
    trophy: z.number({ coerce: true }).min(0).max(65535).int(),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stackTrophy.findUnique({
    select: {
      trophyId: true,
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
