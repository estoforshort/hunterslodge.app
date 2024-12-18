import { z } from "zod";

export default defineCachedEventHandler(
  async (event) => {
    const paramsSchema = z.object({
      profile: z.number({ coerce: true }).positive().int().max(65535),
    });

    const params = await getValidatedRouterParams(event, paramsSchema.parse);

    const orderBy = [
      "firstTrophyEarnedAt",
      "lastTrophyEarnedAt",
      "progress",
      "points",
      "streamPoints",
      "timeStreamed",
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
      prisma.profile.findUnique({
        select: {
          projects: {
            select: {
              stack: {
                select: {
                  id: true,
                  game: {
                    select: {
                      id: true,
                      name: true,
                      imageUrl: true,
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
                  rarity: true,
                  timesCompleted: true,
                  avgProgress: true,
                  value: true,
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
            orderBy: {
              [query.orderBy ?? "lastTrophyEarnedAt"]:
                query.direction ?? "desc",
            },
          },
        },
        where: { id: params.profile },
      }),
      prisma.project.count({
        where: { profileId: params.profile },
      }),
    ]);

    return {
      data: data?.projects ?? [],
      page,
      pageSize,
      totalSize,
    };
  },
  { maxAge: 60 },
);
