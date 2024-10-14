type RequestData = {
  accountId: string;
  limit: number;
  offset: number;
};

export const psnApiFetchProjects = async (requestData: RequestData) => {
  try {
    const tokens = await psnApiAccessToken();

    if (!tokens.data) {
      return {
        data: null,
      };
    }

    const fetchProjects: {
      trophyTitles: {
        npServiceName: string;
        npCommunicationId: string;
        trophySetVersion: string;
        trophyTitleName: string;
        trophyTitleDetail: string | undefined;
        trophyTitleIconUrl: string;
        trophyTitlePlatform: string;
        hasTrophyGroups: boolean;
        trophyGroupCount: number;
        definedTrophies: {
          bronze: number;
          silver: number;
          gold: number;
          platinum: number;
        };
        progress: number;
        earnedTrophies: {
          bronze: number;
          silver: number;
          gold: number;
          platinum: number;
        };
        hiddenFlag: boolean;
        lastUpdatedDateTime: string;
      }[];
      nextOffset: number;
      totalItemCount: number;
    } = await $fetch(
      `${psnApiVariables.BASE_API}/trophy/v1/users/${requestData.accountId}/trophyTitles?limit=${requestData.limit}&offset=${requestData.offset}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.data.accessToken}`,
        },
      },
    );

    return {
      data: fetchProjects,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
