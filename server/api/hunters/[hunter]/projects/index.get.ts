import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    hunter: z.string().min(1).max(25),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const orderBy = [
    "earnedPlatinum",
    "earnedGold",
    "earnedSilver",
    "earnedBronze",
    "streamPlatinum",
    "streamGold",
    "streamSilver",
    "streamBronze",
    "firstTrophyEarnedAt",
    "lastTrophyEarnedAt",
    "progress",
    "points",
    "streamPoints",
    "timeStreamed",
    "createdAt",
    "updatedAt",
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

  const user = await prisma.user.findUnique({
    select: {
      profile: {
        select: {
          id: true,
        },
      },
    },
    where: { username: params.hunter },
  });

  const [data, totalSize] = await Promise.all([
    prisma.profile.findUnique({
      select: {
        projects: {
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
          skip: Math.floor((page - 1) * pageSize),
          take: pageSize,
          orderBy: {
            [query.orderBy ?? "lastTrophyEarnedAt"]: query.direction ?? "desc",
          },
        },
      },
      where: { id: user?.profile?.id ?? 0 },
    }),
    prisma.project.count({
      where: { profileId: user?.profile?.id ?? 0 },
    }),
  ]);

  return {
    data: data?.projects ?? [],
    page,
    pageSize,
    totalSize,
  };
});
