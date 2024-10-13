type RequestData = {
  accessToken: string;
  accountId: string;
};

export const psnApiFetchProfile = async (requestData: RequestData) => {
  try {
    const [fetchProfile, fetchTrophySummary] = await Promise.all([
      $fetch<{
        onlineId: string;
        personalDetail:
          | {
              firstName: string;
              lastName: string;
            }
          | undefined;
        aboutMe: string;
        avatars: { size: string; url: string }[];
        languages: string[];
        isPlus: boolean;
        isOfficiallyVerified: boolean;
        isMe: boolean;
      }>(
        `${psnApiVariables.BASE_API}/userProfile/v1/internal/users/${requestData.accountId}/profiles`,
        {
          headers: {
            Authorization: `Bearer ${requestData.accessToken}`,
          },
        },
      ),
      $fetch<{
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
      }>(
        `${psnApiVariables.BASE_API}/trophy/v1/users/${requestData.accountId}/trophySummary`,
        {
          headers: {
            Authorization: `Bearer ${requestData.accessToken}`,
          },
        },
      ),
    ]);

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
