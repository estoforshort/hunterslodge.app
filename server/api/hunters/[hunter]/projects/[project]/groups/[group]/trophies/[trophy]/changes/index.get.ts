import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    hunter: z.string().min(1).max(25),
    project: z.string().min(1).max(36),
    group: z.string().length(3),
    trophy: z.number({ coerce: true }).int().max(65535),
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
    prisma.projectTrophy.findUnique({
      select: {
        changes: {
          select: {
            pointsFrom: true,
            pointsTo: true,
            createdAt: true,
          },
          skip: Math.floor((page - 1) * pageSize),
          take: pageSize,
          orderBy: { createdAt: "asc" },
        },
      },
      where: {
        profileId_stackId_groupId_trophyId: {
          profileId: user?.profile?.id ?? 0,
          stackId: params.project,
          groupId: params.group,
          trophyId: params.trophy,
        },
      },
    }),
    prisma.projectTrophyChange.count({
      where: {
        profileId: user?.profile?.id ?? 0,
        stackId: params.project,
        groupId: params.group,
        trophyId: params.trophy,
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
