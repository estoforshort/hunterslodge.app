import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    hunter: z.string().min(1).max(25),
    project: z.string().min(1).max(36),
    group: z.string().length(3),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const querySchema = z.object({
    page: z.number({ coerce: true }).positive().int().optional(),
    pageSize: z.number({ coerce: true }).positive().int().max(100).optional(),
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
    prisma.projectGroup.findUnique({
      select: {
        changes: {
          select: {
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
          orderBy: { createdAt: "asc" },
        },
      },
      where: {
        profileId_stackId_groupId: {
          profileId: user?.profile?.id ?? 0,
          stackId: params.project,
          groupId: params.group,
        },
      },
    }),
    prisma.projectGroupChange.count({
      where: {
        profileId: user?.profile?.id ?? 0,
        stackId: params.project,
        groupId: params.group,
      },
    }),
  ]);

  return {
    data: data?.changes ?? [],
    page,
    pageSize,
    totalSize,
  };
});
