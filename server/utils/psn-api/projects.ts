import { psnVariables as variables } from "./variables";
import { psnTokes } from "./tokens";
import fetch from "node-fetch";

import type { TrophyType } from "@prisma/client";

type Projects = {
  accountId: string;
  limit: number;
  offset: number;
};

const projects = async (data: Projects) => {
  try {
    const tokens = await psnTokes.tokensManager();

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

    if (!fetchProjects.ok) {
      return {
        data: null,
      };
    }

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
    const tokens = await psnTokes.tokensManager();

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

    if (!fetchProjectGroups.ok) {
      return {
        data: null,
      };
    }

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
    const tokens = await psnTokes.tokensManager();

    if (!tokens.data) {
      return {
        data: null,
      };
    }

    const fetchProjectGroupTrophies = await fetch(
      `${variables.BASE_API}/trophy/v1/users/${data.accountId}/npCommunicationIds/${data.npCommunicationId}/trophyGroups/${data.trophyGroupId === "000" ? "default" : data.trophyGroupId}/trophies?npServiceName=${data.npServiceName}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.data.accessToken}`,
        },
      },
    );

    if (!fetchProjectGroupTrophies.ok) {
      return {
        data: null,
      };
    }

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

export const psnProjects = {
  projects,
  projectGroups,
  projectGroupTrophies,
};
