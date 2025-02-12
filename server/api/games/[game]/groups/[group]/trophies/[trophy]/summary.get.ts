import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.string().min(1).max(36),
    group: z.string().length(3),
    trophy: z.number({ coerce: true }).min(0).max(65535).int(),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stackTrophy.findUnique({
    select: {
      stackId: true,
      groupId: true,
      trophyId: true,
      gameTrophy: {
        select: {
          type: true,
          name: true,
          description: true,
        },
      },
      firstEarnedAt: true,
      lastEarnedAt: true,
      quality: true,
      timesEarned: true,
      rarity: true,
      value: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      stackId_groupId_trophyId: {
        stackId: params.game,
        groupId: params.group,
        trophyId: params.trophy,
      },
    },
  });

  return { data };
});
