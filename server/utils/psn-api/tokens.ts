import { psnVariables as variables } from "./variables";
import fetch from "node-fetch";
import dayjs from "dayjs";

type ExchangeNpsso = {
  npssoToken: string;
};

// https://ca.account.sony.com/api/v1/ssocookie
const exchangeNpsso = async (data: ExchangeNpsso) => {
  try {
    const step1 = await fetch(
      `${variables.AUTH_API}/authorize?access_type=offline&client_id=${variables.CLIENT_ID}&redirect_uri=${variables.REDIRECT_URI}&response_type=code&scope=${variables.SCOPE}`,
      {
        redirect: "manual",
        headers: {
          Authorization:
            "Basic MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A=",
          Cookie: `npsso=${data.npssoToken}`,
        },
      },
    );

    const location = step1.headers.get("Location")!;
    const code = location.match(/code=([A-Za-z0-9:?_\-./=]+)/)![1];

    const step2 = await fetch(`${variables.AUTH_API}/token`, {
      method: "POST",
      headers: {
        Authorization:
          "Basic MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A=",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `code=${code}&grant_type=authorization_code&redirect_uri=${variables.REDIRECT_URI}&scope=${variables.SCOPE}&token_format=jwt`,
    });

    if (!step2.ok) {
      return {
        data: null,
      };
    }

    const step2Data = (await step2.json()) as {
      access_token: string;
      token_type: string;
      expires_in: number;
      scope: string;
      id_token: string;
      refresh_token: string;
      refresh_token_expires_in: number;
    };

    return {
      data: step2Data,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};

type RefreshTokens = {
  refreshToken: string;
};

const refreshTokens = async (data: RefreshTokens) => {
  try {
    const fetchTokens = await fetch(`${variables.AUTH_API}/token`, {
      method: "POST",
      headers: {
        Authorization:
          "Basic MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A=",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `refresh_token=${data.refreshToken}&grant_type=refresh_token&redirect_uri=${variables.REDIRECT_URI}&scope=${variables.SCOPE}&token_format=jwt`,
    });

    if (!fetchTokens.ok) {
      return {
        data: null,
      };
    }

    const tokensData = (await fetchTokens.json()) as {
      access_token: string;
      token_type: string;
      expires_in: number;
      scope: string;
      id_token: string;
      refresh_token: string;
      refresh_token_expires_in: number;
    };

    return {
      data: tokensData,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};

const tokensManager = defineCachedFunction(
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
        const freshTokens = await refreshTokens({
          refreshToken: currentTokens.refreshToken,
        });

        if (!freshTokens.data) {
          return {
            data: null,
          };
        }

        const updateTokens = await prisma.appTokens.update({
          data: {
            accessToken: freshTokens.data.access_token,
            expiresAt: dayjs().add(freshTokens.data.expires_in, "s").format(),
            refreshToken: freshTokens.data.refresh_token,
            refreshTokenExpiresAt: dayjs()
              .add(freshTokens.data.refresh_token_expires_in, "s")
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
  { maxAge: 300, swr: false, name: "tokensManager", getKey: () => "default" },
);

export const psnTokes = {
  exchangeNpsso,
  tokensManager,
};
