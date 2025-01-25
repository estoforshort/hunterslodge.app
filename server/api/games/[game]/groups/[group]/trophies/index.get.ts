import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.string().min(1).max(36),
    group: z.string().length(3),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stackGroup.findUnique({
    select: {
      trophies: {
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
        orderBy: { trophyId: "asc" },
      },
    },
    where: {
      stackId_groupId: {
        stackId: params.game,
        groupId: params.group,
      },
    },
  });

  return { data: data?.trophies ?? [] };
});
