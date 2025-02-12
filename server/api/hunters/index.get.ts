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
    "updatedAt",
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
        userId: true,
        user: {
          select: {
            username: true,
            displayName: true,
            isAdmin: true,
            isFounder: true,
          },
        },
        regionId: true,
        region: {
          select: {
            name: true,
          },
        },
        onlineId: true,
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
        updatedAt: true,
      },
      skip: Math.floor((page - 1) * pageSize),
      take: pageSize,
      orderBy: {
        [query.orderBy ?? "globalPosition"]: query.direction ?? "asc",
      },
      where: {
        globalPosition: { gte: 1 },
        streamPosition: { gte: query.onlyStreamers === "true" ? 1 : 0 },
      },
    }),
    prisma.profile.count({
      where: {
        globalPosition: { gte: 1 },
        streamPosition: { gte: query.onlyStreamers === "true" ? 1 : 0 },
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
