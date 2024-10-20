import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Obviously needs validation

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
