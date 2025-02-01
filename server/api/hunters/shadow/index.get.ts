import { z } from "zod";

export default defineEventHandler(async (event) => {
  const querySchema = z.object({
    page: z.number({ coerce: true }).positive().int().optional(),
    pageSize: z.number({ coerce: true }).positive().int().max(100).optional(),
  });

  const query = await getValidatedQuery(event, querySchema.parse);

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 100;

  const [data, totalSize] = await Promise.all([
    prisma.profile.findMany({
      select: {
        region: {
          select: {
            id: true,
            name: true,
          },
        },
        onlineId: true,
        earnedPlatinum: true,
        earnedGold: true,
        earnedSilver: true,
        earnedBronze: true,
        points: true,
      },
      skip: Math.floor((page - 1) * pageSize),
      take: pageSize,
      orderBy: { points: "desc" },
      where: {
        userId: null,
      },
    }),
    prisma.profile.count({
      where: {
        userId: null,
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
