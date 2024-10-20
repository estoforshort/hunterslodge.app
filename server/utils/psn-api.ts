import fetch from "node-fetch";
import dayjs from "dayjs";

import type { TrophyType } from "@prisma/client";

const variables = {
  AUTH_API: "https://ca.account.sony.com/api/authz/v3/oauth",
  BASE_API: "https://m.np.playstation.com/api",

  CLIENT_ID: "09515159-7237-4370-9b40-3806e67c0891",
  SCOPE: "psn:mobile.v2.core psn:clientapp",

  REDIRECT_URI: "com.scee.psxandroid.scecompcall://redirect",
};

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

type FindProfile = {
  onlineId: string;
};

const findProfile = async (data: FindProfile) => {
  try {
    const tokens = await tokensManager();

    if (!tokens.data) {
      return {
        data: null,
      };
    }

    const [fetchProfile, fetchAccountId] = await Promise.all([
      fetch(
        `https://us-prof.np.community.playstation.net/userProfile/v1/users/${data.onlineId}/profile`,
        {
          headers: {
            Authorization: `Bearer ${tokens.data.accessToken}`,
          },
        },
      ),
      fetch(
        `https://us-prof.np.community.playstation.net/userProfile/v1/users/${data.onlineId}/profile2?fields=accountId`,
        {
          headers: {
            Authorization: `Bearer ${tokens.data.accessToken}`,
          },
        },
      ),
    ]);

    const profileData = (await fetchProfile.json()) as {
      onlineId: string;
      region: string;
      npId: string;
      avatarUrl: string;
      aboutMe: string;
      languagesUsed: string[];
      plus: number;
    };

    const accountIdData = (await fetchAccountId.json()) as {
      profile: {
        accountId: string;
      };
    };

    const fetchTrophySummary = await fetch(
      `${variables.BASE_API}/trophy/v1/users/${accountIdData.profile.accountId}/trophySummary`,
      {
        headers: {
          Authorization: `Bearer ${tokens.data.accessToken}`,
        },
      },
    );

    const trophySummaryData = (await fetchTrophySummary.json()) as {
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
    };

    return {
      data: {
        profile: profileData,
        trophySummary: trophySummaryData,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};

type Profile = {
  accountId: string;
};

const profile = async (data: Profile) => {
  try {
    const tokens = await tokensManager();

    if (!tokens.data) {
      return {
        data: null,
      };
    }

    const [fetchProfile, fetchTrophySummary] = await Promise.all([
      fetch(
        `${variables.BASE_API}/userProfile/v1/internal/users/${data.accountId}/profiles`,
        {
          headers: {
            Authorization: `Bearer ${tokens.data.accessToken}`,
          },
        },
      ),
      fetch(
        `${variables.BASE_API}/trophy/v1/users/${data.accountId}/trophySummary`,
        {
          headers: {
            Authorization: `Bearer ${tokens.data.accessToken}`,
          },
        },
      ),
    ]);

    const profileData = (await fetchProfile.json()) as {
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
    };

    const trophySummaryData = (await fetchTrophySummary.json()) as {
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
    };

    return {
      data: {
        profile: profileData,
        trophySummary: trophySummaryData,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};

type Projects = {
  accountId: string;
  limit: number;
  offset: number;
};

const projects = async (data: Projects) => {
  try {
    const tokens = await tokensManager();

    if (!tokens.data) {
      return {
        data: null,
      };
    }

    const fetchProjects = await fetch(
      `${variables.BASE_API}/trophy/v1/users/${data.accountId}/trophyTitles?limit=${data.limit}&offset=${data.offset}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.data.accessToken}`,
        },
      },
    );

    const projectsData = (await fetchProjects.json()) as {
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
    };

    return {
      data: projectsData,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};

type ProjectGroups = {
  accountId: string;
  npCommunicationId: string;
  npServiceName: string;
};

const projectGroups = async (data: ProjectGroups) => {
  try {
    const tokens = await tokensManager();

    if (!tokens.data) {
      return {
        data: null,
      };
    }

    const fetchProjectGroups = await fetch(
      `${variables.BASE_API}/trophy/v1/users/${data.accountId}/npCommunicationIds/${data.npCommunicationId}/trophyGroups?npServiceName=${data.npServiceName}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.data.accessToken}`,
        },
      },
    );

    const projectGroupsData = (await fetchProjectGroups.json()) as {
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
    };

    return {
      data: projectGroupsData,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};

type ProjectGroupTrophies = {
  accountId: string;
  npCommunicationId: string;
  trophyGroupId: string;
  npServiceName: string;
};

const projectGroupTrophies = async (data: ProjectGroupTrophies) => {
  try {
    const tokens = await tokensManager();

    if (!tokens.data) {
      return {
        data: null,
      };
    }

    const fetchProjectGroupTrophies = await fetch(
      `${variables.BASE_API}/trophy/v1/users/${data.accountId}/npCommunicationIds/${data.npCommunicationId}/trophyGroups/${data.trophyGroupId}/trophies?npServiceName=${data.npServiceName}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.data.accessToken}`,
        },
      },
    );

    const projectGroupTrophiesData =
      (await fetchProjectGroupTrophies.json()) as {
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
      };

    return {
      data: projectGroupTrophiesData,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};

type GameGroups = {
  npCommunicationId: string;
  npServiceName: string;
};

const gameGroups = async (data: GameGroups) => {
  try {
    const tokens = await tokensManager();

    if (!tokens.data) {
      return {
        data: null,
      };
    }

    const fetchGameGroups = await fetch(
      `${variables.BASE_API}/trophy/v1/npCommunicationIds/${data.npCommunicationId}/trophyGroups?npServiceName=${data.npServiceName}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.data.accessToken}`,
        },
      },
    );

    const gameGroupsData = (await fetchGameGroups.json()) as {
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
    };

    return {
      data: gameGroupsData,
    };
  } catch (e) {
    console.log(e);
    return {
      data: null,
    };
  }
};

type GameGroupTrophies = {
  npCommunicationId: string;
  trophyGroupId: string;
  npServiceName: string;
};

const gameGroupTrophies = async (data: GameGroupTrophies) => {
  try {
    const tokens = await tokensManager();

    if (!tokens.data) {
      return {
        data: null,
      };
    }

    const fetchGameGroupTrophies = await fetch(
      `${variables.BASE_API}/trophy/v1/npCommunicationIds/${data.npCommunicationId}/trophyGroups/${data.trophyGroupId}/trophies?npServiceName=${data.npServiceName}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.data.accessToken}`,
        },
      },
    );

    const gameGroupTrophiesData = (await fetchGameGroupTrophies.json()) as {
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
    };

    return {
      data: gameGroupTrophiesData,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};

export const psn = {
  exchangeNpsso,
  findProfile,
  profile,
  projects,
  projectGroups,
  projectGroupTrophies,
  gameGroups,
  gameGroupTrophies,
};
