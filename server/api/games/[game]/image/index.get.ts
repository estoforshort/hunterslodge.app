import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.string().min(1).max(36),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const stack = await prisma.stack.findUnique({
    select: {
      gameId: true,
    },
    where: { id: params.game },
  });

  if (!stack) {
    return "404 Not Found";
  }

  const findImage = await prisma.gameImage.findUnique({
    where: { gameId: stack.gameId },
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
