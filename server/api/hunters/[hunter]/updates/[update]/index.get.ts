import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    hunter: z.string().min(1).max(25),
    update: z.number({ coerce: true }).positive().int().max(4294967295),
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
    prisma.update.findUnique({
      select: {
        changes: {
          select: {
            stackId: true,
            project: {
              select: {
                stack: {
                  select: {
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
                  },
                },
              },
            },
            earnedPlatinumFrom: true,
            earnedPlatinumTo: true,
            earnedGoldFrom: true,
            earnedGoldTo: true,
            earnedSilverFrom: true,
            earnedSilverTo: true,
            earnedBronzeFrom: true,
            earnedBronzeTo: true,
            streamPlatinumFrom: true,
            streamPlatinumTo: true,
            streamGoldFrom: true,
            streamGoldTo: true,
            streamSilverFrom: true,
            streamSilverTo: true,
            streamBronzeFrom: true,
            streamBronzeTo: true,
            progressFrom: true,
            progressTo: true,
            pointsFrom: true,
            pointsTo: true,
            streamPointsFrom: true,
            streamPointsTo: true,
            createdAt: true,
          },
          skip: Math.floor((page - 1) * pageSize),
          take: pageSize,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      where: { id: params.update },
    }),
    prisma.projectChange.count({
      where: { updateId: params.update },
    }),
  ]);

  return {
    data: data?.changes ?? [],
    page,
    pageSize,
    totalSize,
  };
});
