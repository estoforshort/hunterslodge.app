type RequestData = {
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

export const psnApiFetchGameTrophies = async (requestData: RequestData) => {
  try {
    const tokens = await psnApiAccessToken();

    if (!tokens.data) {
      return {
        data: null,
      };
    }

    const fetchGameTrophies: {
      trophySetVersion: string;
      hasTrophyGroups: boolean;
      trophies: {
        trophyId: number;
        trophyHidden: boolean;
        trophyType: TrophyType;
        trophyName: string;
        trophyDetail: string;
        trophyIconUrl: string;
        trophyGroupId: string;
        trophyProgressTargetValue: string | undefined;
      }[];
      totalItemCount: number;
    } = await $fetch(
      `${psnApiVariables.BASE_API}/trophy/v1/npCommunicationIds/${requestData.npCommunicationId}/trophyGroups/${requestData.trophyGroupId ?? "all"}/trophies?npServiceName=${requestData.npServiceName}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.data.accessToken}`,
        },
      },
    );

    return {
      data: fetchGameTrophies,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
