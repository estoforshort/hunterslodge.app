import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    profile: z.number({ coerce: true }).positive().int().max(65535),
    stream: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.stream.findUnique({
    select: {
      id: true,
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
    where: { id: params.stream },
  });

  return { data };
});
