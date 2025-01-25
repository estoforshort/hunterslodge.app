import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    hunter: z.string().min(1).max(25),
    stream: z.string().min(1).max(36),
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
    prisma.stream.findUnique({
      select: {
        trophies: {
          select: {
            stackTrophy: {
              select: {
                stackId: true,
                groupId: true,
                trophyId: true,
                gameTrophy: {
                  select: {
                    type: true,
                    name: true,
                    description: true,
                  },
                },
                firstEarnedAt: true,
                lastEarnedAt: true,
                quality: true,
                timesEarned: true,
                rarity: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            earnedAt: true,
            points: true,
            createdAt: true,
            updatedAt: true,
          },
          skip: Math.floor((page - 1) * pageSize),
          take: pageSize,
          orderBy: { earnedAt: "desc" },
        },
      },
      where: { id: params.stream },
    }),
    prisma.projectTrophy.count({ where: { streamId: params.stream } }),
  ]);

  return {
    data: data?.trophies ?? [],
    page,
    pageSize,
    totalSize,
  };
});
