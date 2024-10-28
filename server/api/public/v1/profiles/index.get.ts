import { z } from "zod";

export default defineEventHandler(async (event) => {
  const orderBy = [
    "firstTrophyEarnedAt",
    "lastTrophyEarnedAt",
    "startedProjects",
    "completedProjects",
    "definedPlatinum",
    "definedGold",
    "definedSilver",
    "definedBronze",
    "earnedPlatinum",
    "earnedGold",
    "earnedSilver",
    "earnedBronze",
    "hiddenTrophies",
    "completion",
    "points",
    "lastFullUpdateAt",
    "regionalPosition",
    "globalPosition",
    "createdAt",
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

  const [count, data] = await Promise.all([
    prisma.profile.count({
      where: {
        lastFullUpdateAt: { not: null },
      },
    }),
    prisma.profile.findMany({
      select: {
        id: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            imageUrl: true,
            isAdmin: true,
            isFounder: true,
          },
        },
        regionId: true,
        accountId: true,
        onlineId: true,
        imageUrl: true,
        firstTrophyEarnedAt: true,
        lastTrophyEarnedAt: true,
        startedProjects: true,
        completedProjects: true,
        definedPlatinum: true,
        definedGold: true,
        definedSilver: true,
        definedBronze: true,
        earnedPlatinum: true,
        earnedGold: true,
        earnedSilver: true,
        earnedBronze: true,
        hiddenTrophies: true,
        completion: true,
        points: true,
        lastFullUpdateAt: true,
        regionalPosition: true,
        globalPosition: true,
        createdAt: true,
      },
      where: {
        lastFullUpdateAt: { not: null },
      },
      skip: Math.floor((page - 1) * pageSize),
      take: pageSize,
      orderBy: {
        [query.orderBy ?? "globalPosition"]: query.direction ?? "asc",
      },
    }),
  ]);

  return {
    data,
    page,
    pageSize,
    totalSize: count,
  };
});
