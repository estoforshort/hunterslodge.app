import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    profile: z.string().min(1).max(25),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const orderBy = [
    "firstTrophyEarnedAt",
    "lastTrophyEarnedAt",
    "progress",
    "points",
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

  const profile = await prisma.profile.findFirst({
    select: {
      id: true,
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
              psnRate: true,
              timesStarted: true,
              timesCompleted: true,
              avgProgress: true,
              value: true,
            },
          },
          earnedPlatinum: true,
          earnedGold: true,
          earnedSilver: true,
          earnedBronze: true,
          firstTrophyEarnedAt: true,
          lastTrophyEarnedAt: true,
          progress: true,
          points: true,
          timeStreamed: true,
        },
        skip: Math.floor((page - 1) * pageSize),
        take: pageSize,
        orderBy: {
          [query.orderBy ?? "lastTrophyEarnedAt"]: query.direction ?? "desc",
        },
      },
    },
    where: { user: { username: params.profile } },
  });

  const projectsCount = await prisma.project.count({
    where: { profileId: profile?.id ?? 0 },
  });

  return {
    data: profile?.projects ?? [],
    page,
    pageSize,
    totalSize: projectsCount,
  };
});
