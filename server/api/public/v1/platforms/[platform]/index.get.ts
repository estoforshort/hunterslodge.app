import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    platform: z.string().min(1).max(6),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.platform.findUnique({
    select: {
      id: true,
      _count: {
        select: {
          games: true,
        },
      },
    },
    where: { id: params.platform },
  });

  return { data };
});
