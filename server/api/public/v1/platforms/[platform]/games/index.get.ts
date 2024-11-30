import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    platform: z.string().min(1).max(6),
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
    prisma.platform.findUnique({
      select: {
        games: {
          select: {
            game: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                definedPlatinum: true,
                definedGold: true,
                definedSilver: true,
                definedBronze: true,
                platforms: {
                  select: {
                    platformId: true,
                  },
                },
              },
            },
            createdAt: true,
          },
          skip: Math.floor((page - 1) * pageSize),
          take: pageSize,
          orderBy: {
            [query.orderBy ?? "createdAt"]: query.direction ?? "asc",
          },
        },
      },
      where: { id: params.platform },
    }),
    prisma.platformsOnGames.count({ where: { platformId: params.platform } }),
  ]);

  return {
    data: data?.games ?? [],
    page,
    pageSize,
    totalSize,
  };
});
