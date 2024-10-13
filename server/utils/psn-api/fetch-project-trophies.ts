type RequestData = {
  accessToken: string;
  accountId: string;
  npCommunicationId: string;
  trophyGroupId?: string;
  npServiceName: string;
};

enum TrophyType {
  bronze,
  silver,
  gold,
  platinum,
}

export const psnApiFetchProjectTrophies = async (requestData: RequestData) => {
  try {
    const fetchProjectTrophies: {
      trophySetVersion: string;
      hasTrophyGroups: boolean;
      lastUpdatedDateTime: string;
      trophies: {
        trophyId: number;
        trophyHidden: boolean;
        earned: boolean;
        progress: string | undefined;
        progressRate: number | undefined;
        progressedDateTime: string | undefined;
        earnedDateTime: string | undefined;
        trophyType: TrophyType;
        trophyRare: number;
        trophyEarnedRate: string;
      }[];
      rarestTrophies: {
        trophyId: number;
        trophyHidden: boolean;
        earned: boolean;
        earnedDateTime: string | undefined;
        trophyType: TrophyType;
        trophyRare: number;
        trophyEarnedRate: string;
      }[];
      totalItemCount: number;
    } = await $fetch(
      `${psnApiVariables.BASE_API}/trophy/v1/users/${requestData.accountId}/npCommunicationIds/${requestData.npCommunicationId}/trophyGroups/${requestData.trophyGroupId ?? "all"}/trophies?npServiceName=${requestData.npServiceName}`,
      {
        headers: {
          Authorization: `Bearer ${requestData.accessToken}`,
        },
      },
    );

    return {
      data: fetchProjectTrophies,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
