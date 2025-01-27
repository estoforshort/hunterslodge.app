import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stack.findUnique({
    select: {
      groups: {
        select: {
          stackId: true,
          groupId: true,
          gameGroup: {
            select: {
              name: true,
            },
          },
          definedPlatinum: true,
          definedGold: true,
          definedSilver: true,
          definedBronze: true,
          firstTrophyEarnedAt: true,
          lastTrophyEarnedAt: true,
          quality: true,
          timesCompleted: true,
          avgProgress: true,
          value: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { groupId: "asc" },
      },
    },
    where: { id: params.game },
  });

  return { data: data?.groups ?? [] };
});
