import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    profile: z.number({ coerce: true }).positive().int().max(65535),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const orderBy = ["createdAt"] as const;

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
    prisma.profile.findFirst({
      select: {
        updates: {
          select: {
            id: true,
            status: true,
            type: true,
            fullUpdate: true,
            startedAt: true,
            progress: true,
            finishedAt: true,
            startedProjectsFrom: true,
            startedProjectsTo: true,
            completedProjectsFrom: true,
            completedProjectsTo: true,
            definedPlatinumFrom: true,
            definedPlatinumTo: true,
            definedGoldFrom: true,
            definedGoldTo: true,
            definedSilverFrom: true,
            definedSilverTo: true,
            definedBronzeFrom: true,
            definedBronzeTo: true,
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
            hiddenTrophiesFrom: true,
            hiddenTrophiesTo: true,
            completionFrom: true,
            completionTo: true,
            pointsFrom: true,
            pointsTo: true,
            streamPointsFrom: true,
            streamPointsTo: true,
            createdAt: true,
          },
          skip: Math.floor((page - 1) * pageSize),
          take: pageSize,
          orderBy: {
            [query.orderBy ?? "createdAt"]: query.direction ?? "asc",
          },
        },
      },
      where: { id: params.profile },
    }),
    prisma.update.count({
      where: { profileId: params.profile },
    }),
  ]);

  return {
    data: data?.updates ?? [],
    page,
    pageSize,
    totalSize,
  };
});
