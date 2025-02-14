import { psnVariables as variables } from "./variables";
import { psnTokes } from "./tokens";
import fetch from "node-fetch";

type FindProfile = {
  onlineId: string;
};

const findProfile = async (data: FindProfile) => {
  try {
    const tokens = await psnTokes.tokensManager();

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

    if (!fetchProfile.ok || !fetchAccountId.ok) {
      return {
        data: null,
      };
    }

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

    if (!fetchTrophySummary.ok) {
      return {
        data: null,
      };
    }

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
    const tokens = await psnTokes.tokensManager();

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

    if (!fetchProfile.ok || !fetchTrophySummary.ok) {
      return {
        data: null,
      };
    }

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

export const psnProfiles = {
  findProfile,
  profile,
};
