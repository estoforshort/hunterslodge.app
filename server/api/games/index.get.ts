import { z } from "zod";

export default defineEventHandler(async (event) => {
  const orderBy = [
    "firstTrophyEarnedAt",
    "lastTrophyEarnedAt",
    "quality",
    "timesStarted",
    "timesCompleted",
    "avgProgress",
    "value",
  ] as const;

  const platform = ["all", "ps5", "ps4", "psvita", "ps3", "pspc"] as const;

  const querySchema = z.object({
    page: z.number({ coerce: true }).positive().int().optional(),
    pageSize: z.number({ coerce: true }).positive().int().max(100).optional(),
    orderBy: z.enum(orderBy).optional(),
    direction: z.enum(["asc", "desc"]).optional(),
    platform: z.enum(platform).optional(),
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
      where: {
        game: {
          platforms: {
            some: {
              platformId: query.platform === "all" ? undefined : query.platform,
            },
          },
        },
      },
    }),
    prisma.stack.count({
      where: {
        game: {
          platforms: {
            some: {
              platformId: query.platform === "all" ? undefined : query.platform,
            },
          },
        },
      },
    }),
  ]);

  return {
    data,
    page,
    pageSize,
    totalSize,
  };
});
