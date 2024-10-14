import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Obviously needs validation

  const newTokens = await psnApiExcangeNpsso(body.npsso);

  if (!newTokens.data) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
    });
  }

  return await prisma.appTokens.update({
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
});
