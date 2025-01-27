import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    hunter: z.string().min(1).max(25),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const orderBy = ["timeStreamed", "createdAt"] as const;

  const querySchema = z.object({
    page: z.number({ coerce: true }).positive().int().optional(),
    pageSize: z.number({ coerce: true }).positive().int().max(100).optional(),
    orderBy: z.enum(orderBy).optional(),
    direction: z.enum(["asc", "desc"]).optional(),
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
    prisma.profile.findUnique({
      select: {
        streams: {
          select: {
            id: true,
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
            [query.orderBy ?? "createdAt"]: query.direction ?? "desc",
          },
        },
      },
      where: { id: user?.profile?.id ?? 0 },
    }),
    prisma.stream.count({
      where: { profileId: user?.profile?.id ?? 0 },
    }),
  ]);

  return {
    data: data?.streams ?? [],
    page,
    pageSize,
    totalSize,
  };
});
