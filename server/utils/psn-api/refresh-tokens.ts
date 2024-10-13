export const psnApiRefreshTokens = async (refresh_token: string) => {
  try {
    const refreshTokens: {
      access_token: string;
      token_type: string;
      expires_in: number;
      scope: string;
      id_token: string;
      refresh_token: string;
      refresh_token_expires_in: number;
    } = await $fetch(`${psnApiVariables.AUTH_API}/token`, {
      method: "POST",
      headers: {
        Authorization:
          "Basic MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A=",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `refresh_token=${refresh_token}&grant_type=refresh_token&redirect_uri=${psnApiVariables.REDIRECT_URI}&scope=${psnApiVariables.SCOPE}&token_format=jwt`,
    });

    return {
      data: refreshTokens,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
