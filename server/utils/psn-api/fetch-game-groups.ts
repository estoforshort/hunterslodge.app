type RequestData = {
  npCommunicationId: string;
  npServiceName: string;
};

export const psnApiFetchGameGroups = async (requestData: RequestData) => {
  try {
    const tokens = await psnApiAccessToken();

    if (!tokens.data) {
      return {
        data: null,
      };
    }

    const fetchGameGroups: {
      npServiceName: string;
      npCommunicationId: string;
      trophySetVersion: string;
      trophyTitleName: string;
      trophyTitleDetail: string | undefined;
      trophyTitleIconUrl: string;
      trophyTitlePlatform: string;
      definedTrophies: {
        bronze: number;
        silver: number;
        gold: number;
        platinum: number;
      };
      trophyGroups: {
        trophyGroupId: string;
        trophyGroupName: string;
        trophyTitleDetail: string | undefined;
        trophyGroupIconUrl: string;
        definedTrophies: {
          bronze: number;
          silver: number;
          gold: number;
          platinum: number;
        };
      }[];
    } = await $fetch(
      `${psnApiVariables.BASE_API}/trophy/v1/npCommunicationIds/${requestData.npCommunicationId}/trophyGroups?npServiceName=${requestData.npServiceName}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.data.accessToken}`,
        },
      },
    );

    return {
      data: fetchGameGroups,
    };
  } catch (e) {
    console.log(e);
    return {
      data: null,
    };
  }
};
