import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    userId: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const findImage = await prisma.userImage.findUnique({
    where: { userId: params.userId },
  });

  if (!findImage) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
    });
  }

  appendResponseHeaders(event, {
    "cache-control": "max-age=604800",
  });

  return new Blob([findImage.image]);
});
