type RequestData = {
  accountId: string;
  npCommunicationId: string;
  npServiceName: string;
};

export const psnApiFetchProjectGroups = async (requestData: RequestData) => {
  try {
    const tokens = await psnApiAccessToken();

    if (!tokens.data) {
      return {
        data: null,
      };
    }

    const fetchProjectGroups: {
      trophySetVersion: string;
      hiddenFlag: boolean;
      progress: number;
      earnedTrophies: {
        bronze: number;
        silver: number;
        gold: number;
        platinum: number;
      };
      lastUpdatedDateTime: string;
      trophyGroups: {
        trophyGroupId: string;
        progress: number;
        earnedTrophies: {
          bronze: number;
          silver: number;
          gold: number;
          platinum: number;
        };
        lastUpdatedDateTime: string;
      }[];
    } = await $fetch(
      `${psnApiVariables.BASE_API}/trophy/v1/users/${requestData.accountId}/npCommunicationIds/${requestData.npCommunicationId}/trophyGroups?npServiceName=${requestData.npServiceName}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.data.accessToken}`,
        },
      },
    );

    return {
      data: fetchProjectGroups,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
