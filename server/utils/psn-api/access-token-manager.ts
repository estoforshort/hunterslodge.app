import dayjs from "dayjs";

export const psnApiAccessToken = defineCachedFunction(
  async () => {
    try {
      const currentTokens = await prisma.appTokens.findUnique({
        select: {
          accessToken: true,
          expiresAt: true,
          refreshToken: true,
        },
        where: { appId: "app" },
      });

      if (
        !currentTokens ||
        !currentTokens.accessToken ||
        !currentTokens.expiresAt ||
        !currentTokens.refreshToken
      ) {
        return {
          data: null,
        };
      }

      if (dayjs().isAfter(dayjs(currentTokens.expiresAt).subtract(300, "s"))) {
        const newTokens = await psnApiRefreshTokens(currentTokens.refreshToken);

        if (!newTokens.data) {
          return {
            data: null,
          };
        }

        const updateTokens = await prisma.appTokens.update({
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

        return {
          data: {
            accessToken: updateTokens.accessToken,
          },
        };
      }

      return {
        data: {
          accessToken: currentTokens.accessToken,
        },
      };
    } catch (e) {
      console.error(e);
      return {
        data: null,
      };
    }
  },
  { maxAge: 300, swr: false },
);
