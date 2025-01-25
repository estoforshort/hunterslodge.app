import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    region: z.string().length(2),
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
    prisma.profileRegion.findUnique({
      select: {
        positionChanges: {
          select: {
            positionFrom: true,
            positionTo: true,
            createdAt: true,
          },
          skip: Math.floor((page - 1) * pageSize),
          take: pageSize,
          orderBy: { createdAt: "asc" },
        },
      },
      where: { id: params.region },
    }),
    prisma.profileRegionPositionChange.count({
      where: { regionId: params.region },
    }),
  ]);

  return {
    data,
    page,
    pageSize,
    totalSize,
  };
});
