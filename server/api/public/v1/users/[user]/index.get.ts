import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    user: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.user.findUnique({
    select: {
      id: true,
      username: true,
      displayName: true,
      imageUrl: true,
      isAdmin: true,
      isFounder: true,
      isLinked: true,
      createdAt: true,
      profile: {
        select: {
          id: true,
        },
      },
    },
    where: { id: params.user },
  });

  return { data };
});
