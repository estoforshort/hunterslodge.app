import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    hunter: z.string().min(1).max(25),
    stream: z.string().min(1).max(36),
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
    prisma.stream.findUnique({
      select: {
        projects: {
          select: {
            project: {
              select: {
                stack: {
                  select: {
                    id: true,
                    gameId: true,
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
                },
                earnedPlatinum: true,
                earnedGold: true,
                earnedSilver: true,
                earnedBronze: true,
                streamPlatinum: true,
                streamGold: true,
                streamSilver: true,
                streamBronze: true,
                firstTrophyEarnedAt: true,
                lastTrophyEarnedAt: true,
                progress: true,
                points: true,
                streamPoints: true,
                timeStreamed: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            timeStreamed: true,
            createdAt: true,
            updatedAt: true,
          },
          skip: Math.floor((page - 1) * pageSize),
          take: pageSize,
          orderBy: { updatedAt: "desc" },
        },
      },
      where: { id: params.stream },
    }),
    prisma.streamsOnProjects.count({ where: { streamId: params.stream } }),
  ]);

  return {
    data: data?.projects ?? [],
    page,
    pageSize,
    totalSize,
  };
});
