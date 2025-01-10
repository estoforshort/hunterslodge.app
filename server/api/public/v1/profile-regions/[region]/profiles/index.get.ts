import { z } from "zod";

export default defineCachedEventHandler(async (event) => {
  const paramsSchema = z.object({
    region: z.string().length(2),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

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
  });

  const query = await getValidatedQuery(event, querySchema.parse);

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 100;

  const [data, totalSize] = await Promise.all([
    prisma.profileRegion.findUnique({
      select: {
        profiles: {
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
          where: { regionalPosition: { gte: 1 } },
          skip: Math.floor((page - 1) * pageSize),
          take: pageSize,
          orderBy: {
            [query.orderBy ?? "regionalPosition"]: query.direction ?? "asc",
          },
        },
      },
      where: { id: params.region },
    }),
    prisma.profile.count({
      where: { regionId: params.region, regionalPosition: { gte: 1 } },
    }),
  ]);

  return {
    data: data?.profiles ?? [],
    page,
    pageSize,
    totalSize,
  };
});
