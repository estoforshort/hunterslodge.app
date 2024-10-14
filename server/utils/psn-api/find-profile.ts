export const psnApiFindProfile = async (onlineId: string) => {
  try {
    const tokens = await psnApiAccessToken();

    if (!tokens.data) {
      return {
        data: null,
      };
    }

    const [fetchProfile, fetchAccountId] = await Promise.all([
      $fetch<{
        onlineId: string;
        region: string;
        npId: string;
        avatarUrl: string;
        aboutMe: string;
        languagesUsed: string[];
        plus: number;
      }>(
        `https://us-prof.np.community.playstation.net/userProfile/v1/users/${onlineId}/profile`,
        {
          headers: {
            Authorization: `Bearer ${tokens.data.accessToken}`,
          },
        },
      ),
      $fetch<{
        profile: {
          accountId: string;
        };
      }>(
        `https://us-prof.np.community.playstation.net/userProfile/v1/users/${onlineId}/profile2?fields=accountId`,
        {
          headers: {
            Authorization: `Bearer ${tokens.data.accessToken}`,
          },
        },
      ),
    ]);

    const fetchTrophySummary: {
      accountId: string;
      trophyLevel: number;
      trophyPoint: number;
      trophyLevelBasePoint: number;
      trophyLevelNextPoint: number;
      progress: number;
      tier: number;
      earnedTrophies: {
        bronze: number;
        silver: number;
        gold: number;
        platinum: number;
      };
    } = await $fetch(
      `${psnApiVariables.BASE_API}/trophy/v1/users/${fetchAccountId.profile.accountId}/trophySummary`,
      {
        headers: {
          Authorization: `Bearer ${tokens.data.accessToken}`,
        },
      },
    );

    return {
      data: {
        profile: fetchProfile,
        trophySummary: fetchTrophySummary,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
