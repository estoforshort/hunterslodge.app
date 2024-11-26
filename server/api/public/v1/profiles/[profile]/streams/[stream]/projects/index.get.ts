import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    profile: z.number({ coerce: true }).positive().int().max(65535),
    stream: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stream.findUnique({
    select: {
      projects: {
        select: {
          project: {
            select: {
              stack: {
                select: {
                  game: {
                    select: {
                      id: true,
                      name: true,
                      imageUrl: true,
                    },
                  },
                },
              },
            },
          },
          timeStreamed: true,
        },
        orderBy: { updatedAt: "desc" },
      },
    },
    where: { id: params.stream },
  });

  return { data: data?.projects ?? [] };
});
