import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    region: z.string().length(2),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const querySchema = z.object({
    page: z.number({ coerce: true }).positive().int().optional(),
    pageSize: z.number({ coerce: true }).positive().int().max(100).optional(),
  });

  const query = await getValidatedQuery(event, querySchema.parse);

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 100;

  const [data, totalSize] = await Promise.all([
    prisma.profileRegion.findUnique({
      select: {
        profiles: {
          select: {
            user: {
              select: {
                username: true,
                displayName: true,
                isAdmin: true,
                isFounder: true,
              },
            },
            region: {
              select: {
                id: true,
                name: true,
              },
            },
            earnedPlatinum: true,
            earnedGold: true,
            earnedSilver: true,
            earnedBronze: true,
            points: true,
            streamPosition: true,
            regionalPosition: true,
          },
          skip: Math.floor((page - 1) * pageSize),
          take: pageSize,
          orderBy: { regionalPosition: "asc" },
          where: { regionalPosition: { gte: 1 } },
        },
      },
      where: { id: params.region },
    }),
    prisma.profile.count({
      where: {
        regionId: params.region,
        regionalPosition: { gte: 1 },
      },
    }),
  ]);

  return {
    data: data?.profiles ?? [],
    page,
    pageSize,
    totalSize,
  };
});
