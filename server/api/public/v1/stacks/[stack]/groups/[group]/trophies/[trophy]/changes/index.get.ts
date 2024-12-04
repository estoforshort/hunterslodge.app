import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    stack: z.string().min(1).max(36),
    group: z.string().length(3),
    trophy: z.number({ coerce: true }).min(0).max(65535).int(),
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
            [query.orderBy ?? "createdAt"]: query.direction ?? "asc",
          },
        },
      },
      where: {
        stackId_groupId_trophyId: {
          stackId: params.stack,
          groupId: params.group,
          trophyId: params.trophy,
        },
      },
    }),
    prisma.stackTrophyChange.count({
      where: {
        stackId: params.stack,
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
