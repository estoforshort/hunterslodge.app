import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.number({ coerce: true }).positive().int().max(65535),
    stack: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stack.findUnique({
    select: {
      groups: {
        select: {
          groupId: true,
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
