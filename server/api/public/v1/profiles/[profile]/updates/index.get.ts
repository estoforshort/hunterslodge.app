import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    profile: z.string().min(1).max(25),
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

  const profile = await prisma.profile.findFirst({
    select: {
      id: true,
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
          hiddenTrophiesFrom: true,
          hiddenTrophiesTo: true,
          completionFrom: true,
          completionTo: true,
          pointsFrom: true,
          pointsTo: true,
          createdAt: true,
        },
        skip: Math.floor((page - 1) * pageSize),
        take: pageSize,
        orderBy: {
          [query.orderBy ?? "createdAt"]: query.direction ?? "desc",
        },
      },
    },
    where: { user: { username: params.profile } },
  });

  const updatesCount = await prisma.update.count({
    where: { profileId: profile?.id ?? 0 },
  });

  return {
    data: profile?.updates ?? [],
    page,
    pageSize,
    totalSize: updatesCount,
  };
});
