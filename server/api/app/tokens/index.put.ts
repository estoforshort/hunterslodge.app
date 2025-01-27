import dayjs from "dayjs";
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
    npsso: z.string().min(1),
  });

  const body = await readValidatedBody(event, bodySchema.parse);
  const newTokens = await psn.exchangeNpsso({ npssoToken: body.npsso });

  if (!newTokens.data) {
    return {
      data: {
        success: false,
        message: "Successfully failed to get the new tokens",
      },
    };
  }

  await prisma.appTokens.update({
    data: {
      accessToken: newTokens.data.access_token,
      expiresAt: dayjs().add(newTokens.data.expires_in, "s").format(),
      refreshToken: newTokens.data.refresh_token,
      refreshTokenExpiresAt: dayjs()
        .add(newTokens.data.refresh_token_expires_in, "s")
        .format(),
    },
    where: { appId: "app" },
  });

  await useStorage("cache").removeItem(
    "nitro:functions:tokensManager:default.json",
  );

  return {
    data: {
      success: true,
      message: "App tokens successfully updated",
    },
  };
});
