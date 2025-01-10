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
    "streamPlatinum",
    "streamGold",
    "streamSilver",
    "streamBronze",
    "hiddenTrophies",
    "completion",
    "points",
    "streamPoints",
    "timeStreamed",
    "lastFullUpdateAt",
    "streamPosition",
    "regionalPosition",
    "globalPosition",
    "createdAt",
  ] as const;

  const querySchema = z.object({
    page: z.number({ coerce: true }).positive().int().optional(),
    pageSize: z.number({ coerce: true }).positive().int().max(100).optional(),
    orderBy: z.enum(orderBy).optional(),
    direction: z.enum(["asc", "desc"]).optional(),
    onlyStreamers: z.enum(["true", "false"]).optional(),
  });

  const query = await getValidatedQuery(event, querySchema.parse);

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 100;

  const [data, totalSize] = await Promise.all([
    prisma.profile.findMany({
      select: {
        id: true,
        userId: true,
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
        streamPlatinum: true,
        streamGold: true,
        streamSilver: true,
        streamBronze: true,
        hiddenTrophies: true,
        completion: true,
        points: true,
        streamPoints: true,
        timeStreamed: true,
        lastFullUpdateAt: true,
        streamPosition: true,
        regionalPosition: true,
        globalPosition: true,
        createdAt: true,
      },
      where: {
        globalPosition: { gte: 1 },
        streamPoints: { gte: query.onlyStreamers === "true" ? 0.01 : 0 },
      },
      skip: Math.floor((page - 1) * pageSize),
      take: pageSize,
      orderBy: {
        [query.orderBy ?? "globalPosition"]: query.direction ?? "asc",
      },
    }),
    prisma.profile.count({
      where: {
        globalPosition: { gt: 0 },
        streamPoints: { gte: query.onlyStreamers === "true" ? 0.01 : 0 },
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
