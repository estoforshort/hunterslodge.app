import { z } from "zod";

export default defineEventHandler(async (event) => {
  const orderBy = [
    "maxViewers",
    "avgViewers",
    "platinum",
    "gold",
    "silver",
    "bronze",
    "timeStreamed",
    "endsAt",
    "createdAt",
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

  const [data, totalSize] = await Promise.all([
    prisma.stream.findMany({
      select: {
        id: true,
        profile: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                imageUrl: true,
              },
            },
          },
        },
        maxViewers: true,
        avgViewers: true,
        platinum: true,
        gold: true,
        silver: true,
        bronze: true,
        timeStreamed: true,
        endsAt: true,
        createdAt: true,
      },
      skip: Math.floor((page - 1) * pageSize),
      take: pageSize,
      orderBy: {
        [query.orderBy ?? "createdAt"]: query.direction ?? "asc",
      },
    }),
    prisma.stream.count(),
  ]);

  return {
    data,
    page,
    pageSize,
    totalSize,
  };
});
