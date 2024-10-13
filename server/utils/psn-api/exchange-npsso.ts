export const psnApiExcangeNpsso = async (npssoToken: string) => {
  try {
    const step1 = await fetch(
      `${psnApiVariables.AUTH_API}/authorize?access_type=offline&client_id=${psnApiVariables.CLIENT_ID}&redirect_uri=${psnApiVariables.REDIRECT_URI}&response_type=code&scope=${psnApiVariables.SCOPE}`,
      {
        redirect: "manual",
        headers: {
          Authorization:
            "Basic MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A=",
          Cookie: `npsso=${npssoToken}`,
        },
      },
    );

    const location = step1.headers.get("Location")!;
    const code = location.match(/code=([A-Za-z0-9:?_\-./=]+)/)![1];

    const step2: {
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
      body: `code=${code}&grant_type=authorization_code&redirect_uri=${psnApiVariables.REDIRECT_URI}&scope=${psnApiVariables.SCOPE}&token_format=jwt`,
    });

    return {
      data: step2,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
