import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    stack: z.string().min(1).max(36),
    group: z.string().length(3),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stackGroup.findUnique({
    select: {
      trophies: {
        select: {
          gameId: true,
          groupId: true,
          trophyId: true,
          firstEarnedAt: true,
          lastEarnedAt: true,
          quality: true,
          timesEarned: true,
          rarity: true,
          value: true,
          createdAt: true,
        },
        orderBy: { trophyId: "asc" },
      },
    },
    where: {
      stackId_groupId: {
        stackId: params.stack,
        groupId: params.group,
      },
    },
  });

  return { data: data?.trophies ?? [] };
});
