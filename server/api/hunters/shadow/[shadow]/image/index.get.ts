import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    shadow: z.string().min(1).max(25),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const findImage = await prisma.profileImage.findFirst({
    where: { profile: { onlineId: params.shadow } },
  });

  if (!findImage) {
    return "404 Not Found";
  }

  const fileType = await fileTypeFromBuffer(findImage.image);

  appendResponseHeaders(event, {
    "content-type": fileType?.mime,
    "cache-control": "max-age=604800",
  });

  return new Blob([findImage.image]);
});
