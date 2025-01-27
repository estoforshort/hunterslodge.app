import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.string().min(1).max(36),
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
    prisma.stack.findUnique({
      select: {
        projects: {
          select: {
            profile: {
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
                streamPosition: true,
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
          },
          skip: Math.floor((page - 1) * pageSize),
          take: pageSize,
          orderBy: [{ progress: "desc" }, { lastTrophyEarnedAt: "asc" }],
        },
      },
      where: {
        id: params.game,
      },
    }),
    prisma.project.count({
      where: {
        stackId: params.game,
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
