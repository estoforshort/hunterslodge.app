import { z } from "zod";

export default defineCachedEventHandler(async (event) => {
  const orderBy = [
    "earnedPlatinum",
    "earnedGold",
    "earnedSilver",
    "earnedBronze",
    "streamPlatinum",
    "streamGold",
    "streamSilver",
    "streamBronze",
    "points",
    "streamPoints",
    "timeStreamed",
    "streamPosition",
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
        earnedPlatinum: true,
        earnedGold: true,
        earnedSilver: true,
        earnedBronze: true,
        streamPlatinum: true,
        streamGold: true,
        streamSilver: true,
        streamBronze: true,
        points: true,
        streamPoints: true,
        timeStreamed: true,
        streamPosition: true,
        globalPosition: true,
        createdAt: true,
      },
      where: {
        globalPosition: { gte: 1 },
        streamPosition: { gte: query.onlyStreamers === "true" ? 1 : 0 },
      },
      skip: Math.floor((page - 1) * pageSize),
      take: pageSize,
      orderBy: {
        [query.orderBy ?? "globalPosition"]: query.direction ?? "asc",
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
