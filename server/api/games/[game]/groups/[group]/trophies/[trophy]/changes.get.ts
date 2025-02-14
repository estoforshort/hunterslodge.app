import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.string().min(1).max(36),
    group: z.string().length(3),
    trophy: z.number({ coerce: true }).min(0).max(65535).int(),
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
    prisma.stackTrophy.findUnique({
      select: {
        changes: {
          select: {
            qualityFrom: true,
            qualityTo: true,
            timesEarnedFrom: true,
            timesEarnedTo: true,
            rarityFrom: true,
            rarityTo: true,
            valueFrom: true,
            valueTo: true,
            createdAt: true,
          },
          skip: Math.floor((page - 1) * pageSize),
          take: pageSize,
          orderBy: {
            createdAt: "asc",
          },
          where: {
            createdAt: { gt: new Date("2025-01-28T10:00:00") },
          },
        },
      },
      where: {
        stackId_groupId_trophyId: {
          stackId: params.game,
          groupId: params.group,
          trophyId: params.trophy,
        },
      },
    }),
    prisma.stackTrophyChange.count({
      where: {
        stackId: params.game,
        groupId: params.group,
        trophyId: params.trophy,
        createdAt: { gt: new Date("2025-01-28T10:00:00") },
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
