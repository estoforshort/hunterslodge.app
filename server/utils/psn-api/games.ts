import { psnVariables as variables } from "./variables";
import { psnTokes } from "./tokens";
import fetch from "node-fetch";

import type { TrophyType } from "@prisma/client";

type GameGroups = {
  npCommunicationId: string;
  npServiceName: string;
};

const gameGroups = async (data: GameGroups) => {
  try {
    const tokens = await psnTokes.tokensManager();

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

    if (!fetchGameGroups.ok) {
      return {
        data: null,
      };
    }

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
    const tokens = await psnTokes.tokensManager();

    if (!tokens.data) {
      return {
        data: null,
      };
    }

    const fetchGameGroupTrophies = await fetch(
      `${variables.BASE_API}/trophy/v1/npCommunicationIds/${data.npCommunicationId}/trophyGroups/${data.trophyGroupId === "000" ? "default" : data.trophyGroupId}/trophies?npServiceName=${data.npServiceName}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.data.accessToken}`,
        },
      },
    );

    if (!fetchGameGroupTrophies.ok) {
      return {
        data: null,
      };
    }

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

export const psnGames = {
  gameGroups,
  gameGroupTrophies,
};
