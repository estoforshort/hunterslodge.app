import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    hunter: z.string().min(1).max(25),
    project: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const querySchema = z.object({
    page: z.number({ coerce: true }).positive().int().optional(),
    pageSize: z.number({ coerce: true }).positive().int().max(100).optional(),
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
    prisma.project.findUnique({
      select: {
        streams: {
          select: {
            stream: {
              select: {
                id: true,
              },
            },
            timeStreamed: true,
            createdAt: true,
          },
          skip: Math.floor((page - 1) * pageSize),
          take: pageSize,
          orderBy: { createdAt: "desc" },
        },
      },
      where: {
        profileId_stackId: {
          profileId: user?.profile?.id ?? 0,
          stackId: params.project,
        },
      },
    }),
    prisma.streamsOnProjects.count({
      where: { profileId: user?.profile?.id ?? 0, stackId: params.project },
    }),
  ]);

  return {
    data: data?.streams ?? [],
    page,
    pageSize,
    totalSize,
  };
});
