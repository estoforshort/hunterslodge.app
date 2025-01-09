import { z } from "zod";

export default defineEventHandler(async (event) => {
  const orderBy = [
    "name",
    "definedPlatinum",
    "definedGold",
    "definedSilver",
    "definedBronze",
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
    prisma.game.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
        definedPlatinum: true,
        definedGold: true,
        definedSilver: true,
        definedBronze: true,
        createdAt: true,
        platforms: {
          select: {
            platformId: true,
          },
        },
      },
      skip: Math.floor((page - 1) * pageSize),
      take: pageSize,
      orderBy: {
        [query.orderBy ?? "createdAt"]: query.direction ?? "asc",
      },
    }),
    prisma.game.count(),
  ]);

  return {
    data,
    page,
    pageSize,
    totalSize,
  };
});
