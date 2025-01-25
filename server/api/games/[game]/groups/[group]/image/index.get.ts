import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    game: z.string().min(1).max(36),
    group: z.string().length(3),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const stack = await prisma.stack.findUniqueOrThrow({
    select: {
      gameId: true,
    },
    where: { id: params.game },
  });

  const findImage = await prisma.groupImage.findUniqueOrThrow({
    where: {
      gameId_groupId: {
        gameId: stack.gameId,
        groupId: params.group,
      },
    },
  });

  const fileType = await fileTypeFromBuffer(findImage.image);

  appendResponseHeaders(event, {
    "content-type": fileType?.mime,
    "cache-control": "max-age=604800",
  });

  return new Blob([findImage.image]);
});
