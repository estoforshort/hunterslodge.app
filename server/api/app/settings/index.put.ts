import { z } from "zod";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (!session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const bodySchema = z.object({
    overlaysEnabled: z.boolean(),
    linkingEnabled: z.boolean(),
    updatesEnabled: z.boolean(),
  });

  const body = await readValidatedBody(event, bodySchema.parse);

  await prisma.appSettings.update({
    where: { appId: "app" },
    data: body,
  });

  return true;
});
