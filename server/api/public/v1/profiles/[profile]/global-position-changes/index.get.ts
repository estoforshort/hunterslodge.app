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
    prisma.profile.findUnique({
      select: {
        globalPositionChanges: {
          select: {
            globalPositionFrom: true,
            globalPositionTo: true,
            createdAt: true,
          },
          skip: Math.floor((page - 1) * pageSize),
          take: pageSize,
          orderBy: {
            [query.orderBy ?? "createdAt"]: query.direction ?? "desc",
          },
        },
      },
      where: { id: params.profile },
    }),
    prisma.profileGlobalPositionChange.count({
      where: { profileId: params.profile },
    }),
  ]);

  return {
    data: data?.globalPositionChanges ?? [],
    page,
    pageSize,
    totalSize,
  };
});
