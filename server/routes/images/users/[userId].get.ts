import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    userId: z.string().min(1),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const findImage = await getUserImage(params.userId);

  if (!findImage) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
    });
  }

  return Buffer.from(findImage.image);
});
