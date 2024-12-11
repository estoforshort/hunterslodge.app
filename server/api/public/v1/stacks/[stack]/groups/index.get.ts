import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    stack: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stack.findUnique({
    select: {
      groups: {
        select: {
          gameId: true,
          groupId: true,
          gameGroup: {
            select: {
              name: true,
              imageUrl: true,
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
        },
        orderBy: { groupId: "asc" },
      },
    },
    where: { id: params.stack },
  });

  return { data: data?.groups ?? [] };
});
