import { z } from "zod";

export default defineEventHandler(async (event) => {
  const orderBy = [
    "definedPlatinum",
    "definedGold",
    "definedSilver",
    "definedBronze",
    "firstTrophyEarnedAt",
    "lastTrophyEarnedAt",
    "quality",
    "timesStarted",
    "timesCompleted",
    "avgProgress",
    "value",
    "createdAt",
    "updatedAt",
  ] as const;

  const querySchema = z.object({
    page: z.number({ coerce: true }).positive().int().optional(),
    pageSize: z.number({ coerce: true }).positive().int().max(100).optional(),
    orderBy: z.enum(orderBy).optional(),
    direction: z.enum(["asc", "desc"]).optional(),
  });

  const query = await getValidatedQuery(event, querySchema.parse);

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 100;

  const [data, totalSize] = await Promise.all([
    prisma.stack.findMany({
      select: {
        id: true,
        game: {
          select: {
            name: true,
            platforms: {
              select: {
                platformId: true,
              },
            },
          },
        },
        definedPlatinum: true,
        definedGold: true,
        definedSilver: true,
        definedBronze: true,
        firstTrophyEarnedAt: true,
        lastTrophyEarnedAt: true,
        quality: true,
        timesStarted: true,
        timesCompleted: true,
        avgProgress: true,
        value: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: Math.floor((page - 1) * pageSize),
      take: pageSize,
      orderBy: {
        [query.orderBy ?? "createdAt"]: query.direction ?? "asc",
      },
    }),
    prisma.stack.count(),
  ]);

  return {
    data,
    page,
    pageSize,
    totalSize,
  };
});
