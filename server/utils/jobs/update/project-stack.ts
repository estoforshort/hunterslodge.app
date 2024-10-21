import { updateProjectAndStackGroup } from "./project-stack/group";
import { createHash } from "node:crypto";
import { updateGame } from "./game";
import dayjs from "dayjs";

import type { Prisma } from "@prisma/client";

type Data = {
  profile: {
    id: number;
    accountId: string;
    completion: number;
  };
  project: {
    npServiceName: string;
    npCommunicationId: string;
    trophyTitleName: string;
    trophyTitleIconUrl: string;
    trophyTitlePlatform: string;
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
  };
};

export const updateProjectAndStack = async (data: Data) => {
  try {
    let updateSuccessful = true;

    const findProjectWithStack = await prisma.project.findUnique({
      where: {
        profileId_stackId: {
          profileId: data.profile.id,
          stackId: data.project.npCommunicationId,
        },
      },
      include: { stack: true },
    });

    if (
      !findProjectWithStack ||
      findProjectWithStack.earnedPlatinum !==
        data.project.earnedTrophies.platinum ||
      findProjectWithStack.earnedGold !== data.project.earnedTrophies.gold ||
      findProjectWithStack.earnedSilver !==
        data.project.earnedTrophies.silver ||
      findProjectWithStack.earnedBronze !==
        data.project.earnedTrophies.bronze ||
      Number(findProjectWithStack.value) !==
        Number(findProjectWithStack.stack.value) ||
      findProjectWithStack.completion !== data.profile.completion ||
      findProjectWithStack.stack.definedPlatinum !==
        data.project.definedTrophies.platinum ||
      findProjectWithStack.stack.definedGold !==
        data.project.definedTrophies.gold ||
      findProjectWithStack.stack.definedSilver !==
        data.project.definedTrophies.silver ||
      findProjectWithStack.stack.definedBronze !==
        data.project.definedTrophies.bronze
    ) {
      const projectGroups = await psn.projectGroups({
        accountId: data.profile.accountId,
        npCommunicationId: data.project.npCommunicationId,
        npServiceName: data.project.npServiceName,
      });

      if (!projectGroups.data) {
        return {
          data: null,
        };
      }

      const getStack = async () => {
        const findStack = await prisma.stack.findUnique({
          where: { id: data.project.npCommunicationId },
          include: { game: true },
        });

        const name = data.project.trophyTitleName.replace(/\s+/g, " ").trim();
        const hash = createHash("md5")
          .update(
            `${data.project.npServiceName}-${name}-${data.project.trophyTitlePlatform}-${data.project.definedTrophies.platinum}-${data.project.definedTrophies.gold}-${data.project.definedTrophies.silver}-${data.project.definedTrophies.gold}`,
          )
          .digest("hex");

        if (findStack) {
          if (findStack.game.hash !== hash) {
            await updateGame({
              gameId: findStack.gameId,
              hash,
              stackId: data.project.npCommunicationId,
              service: data.project.npServiceName,
              name,
              imageUrl: data.project.trophyTitleIconUrl,
              platform: data.project.trophyTitlePlatform,
              definedPlatinum: data.project.definedTrophies.platinum,
              definedGold: data.project.definedTrophies.gold,
              definedSilver: data.project.definedTrophies.silver,
              definedBronze: data.project.definedTrophies.bronze,
            });
          }

          return findStack;
        }

        const game = await updateGame({
          gameId: null,
          hash,
          stackId: data.project.npCommunicationId,
          service: data.project.npServiceName,
          name,
          imageUrl: data.project.trophyTitleIconUrl,
          platform: data.project.trophyTitlePlatform,
          definedPlatinum: data.project.definedTrophies.platinum,
          definedGold: data.project.definedTrophies.gold,
          definedSilver: data.project.definedTrophies.silver,
          definedBronze: data.project.definedTrophies.bronze,
        });

        if (!game.data) {
          return null;
        }

        return await prisma.stack.create({
          data: {
            id: data.project.npCommunicationId,
            gameId: game.data.id,
          },
        });
      };

      const stack = await getStack();

      if (!stack) {
        return {
          data: null,
        };
      }

      let newProject = false;

      const getProject = async () => {
        const findProject = await prisma.project.findUnique({
          where: {
            profileId_stackId: {
              profileId: data.profile.id,
              stackId: stack.id,
            },
          },
        });

        if (findProject) return findProject;

        newProject = true;

        return await prisma.project.create({
          data: {
            profileId: data.profile.id,
            stackId: stack.id,
            appId: "app",
          },
        });
      };

      const project = await getProject();

      const timesStarted = await prisma.project.count({
        where: { stackId: stack.id },
      });

      const projectData = {
        earnedPlatinum: data.project.earnedTrophies.platinum,
        earnedGold: data.project.earnedTrophies.gold,
        earnedSilver: data.project.earnedTrophies.silver,
        earnedBronze: data.project.earnedTrophies.bronze,
        firstTrophyEarnedAt: project.firstTrophyEarnedAt,
        lastTrophyEarnedAt: project.lastTrophyEarnedAt,
        progress: data.project.progress,
        value: 0 as unknown as Prisma.Decimal,
        points: 0 as unknown as Prisma.Decimal,
        completion: data.profile.completion,
      };

      const stackData = {
        definedPlatinum: data.project.definedTrophies.platinum,
        definedGold: data.project.definedTrophies.gold,
        definedSilver: data.project.definedTrophies.silver,
        definedBronze: data.project.definedTrophies.bronze,
        firstTrophyEarnedAt: stack.firstTrophyEarnedAt,
        lastTrophyEarnedAt: stack.lastTrophyEarnedAt,
        psnRate: 0 as unknown as Prisma.Decimal,
        timesStarted: timesStarted,
        timesCompleted: 0,
        avgProgress: 0,
        value: 0 as unknown as Prisma.Decimal,
      };

      for (
        let pg = 0, pgl = projectGroups.data.trophyGroups.length;
        pg < pgl;
        pg++
      ) {
        const group = projectGroups.data.trophyGroups[pg];

        const updatedGroup = await updateProjectAndStackGroup({
          profile: data.profile,
          game: {
            id: stack.gameId,
            service: data.project.npServiceName,
          },
          stack: {
            id: stack.id,
            timesStarted,
          },
          group,
        });

        if (!updatedGroup.data) {
          updateSuccessful = false;
          break;
        }

        if (updatedGroup.data.projectGroup.firstTrophyEarnedAt) {
          if (
            !projectData.firstTrophyEarnedAt ||
            dayjs(updatedGroup.data.projectGroup.firstTrophyEarnedAt).isBefore(
              projectData.firstTrophyEarnedAt,
            )
          ) {
            projectData.firstTrophyEarnedAt = dayjs(
              updatedGroup.data.projectGroup.firstTrophyEarnedAt,
            ).format() as unknown as Date;
          }
        }

        if (updatedGroup.data.projectGroup.lastTrophyEarnedAt) {
          if (
            !projectData.lastTrophyEarnedAt ||
            dayjs(updatedGroup.data.projectGroup.lastTrophyEarnedAt).isAfter(
              projectData.lastTrophyEarnedAt,
            )
          ) {
            projectData.lastTrophyEarnedAt = dayjs(
              updatedGroup.data.projectGroup.lastTrophyEarnedAt,
            ).format() as unknown as Date;
          }
        }

        projectData.value = (Math.round(
          (Number(projectData.value) +
            Number(updatedGroup.data.stackGroup.value) +
            Number.EPSILON) *
            100,
        ) / 100) as unknown as Prisma.Decimal;

        projectData.points = (Math.round(
          (Number(projectData.points) +
            Number(updatedGroup.data.projectGroup.points) +
            Number.EPSILON) *
            100,
        ) / 100) as unknown as Prisma.Decimal;

        if (updatedGroup.data.stackGroup.firstTrophyEarnedAt) {
          if (
            !stackData.firstTrophyEarnedAt ||
            dayjs(updatedGroup.data.stackGroup.firstTrophyEarnedAt).isAfter(
              stackData.firstTrophyEarnedAt,
            )
          ) {
            stackData.firstTrophyEarnedAt = dayjs(
              updatedGroup.data.stackGroup.firstTrophyEarnedAt,
            ).format() as unknown as Date;
          }
        }

        if (updatedGroup.data.stackGroup.lastTrophyEarnedAt) {
          if (
            !stackData.lastTrophyEarnedAt ||
            dayjs(updatedGroup.data.stackGroup.lastTrophyEarnedAt).isAfter(
              stackData.lastTrophyEarnedAt,
            )
          ) {
            stackData.lastTrophyEarnedAt = dayjs(
              updatedGroup.data.stackGroup.lastTrophyEarnedAt,
            ).format() as unknown as Date;
          }
        }

        stackData.psnRate = (Number(stackData.psnRate) +
          Number(
            updatedGroup.data.stackGroup.psnRate,
          )) as unknown as Prisma.Decimal;

        stackData.value = (Math.round(
          (Number(stackData.value) +
            Number(updatedGroup.data.stackGroup.value) +
            Number.EPSILON) *
            100,
        ) / 100) as unknown as Prisma.Decimal;
      }

      if (!updateSuccessful) {
        return {
          data: null,
        };
      }

      const updateProject = await prisma.project.update({
        where: {
          profileId_stackId: {
            profileId: data.profile.id,
            stackId: stack.id,
          },
        },
        data: projectData,
      });

      const [avgPsnRate, timesCompleted, avgProgress] = await Promise.all([
        prisma.stackTrophy.aggregate({
          _avg: {
            psnRate: true,
          },
          where: { stackId: stack.id },
        }),
        prisma.project.count({ where: { stackId: stack.id, progress: 100 } }),
        prisma.project.aggregate({
          _avg: {
            progress: true,
          },
          where: { stackId: stack.id },
        }),
      ]);

      if (avgPsnRate._avg.psnRate) {
        stackData.psnRate = avgPsnRate._avg.psnRate;
      }

      stackData.timesCompleted = timesCompleted;

      if (avgProgress._avg.progress) {
        stackData.avgProgress = avgProgress._avg.progress;
      }

      const updateStack = await prisma.stack.update({
        where: { id: stack.id },
        data: stackData,
      });

      return {
        data: {
          project: updateProject,
          changes: {
            new: newProject,
            progress: {
              old: project.progress,
              new: updateProject.progress,
            },
            trophies: {
              defined: {
                platinum: newProject ? updateStack.definedPlatinum : 0,
                gold: newProject ? updateStack.definedGold : 0,
                silver: newProject ? updateStack.definedSilver : 0,
                bronze: newProject ? updateStack.definedBronze : 0,
              },
              earned: {
                platinum: updateProject.earnedPlatinum - project.earnedPlatinum,
                gold: updateProject.earnedGold - project.earnedGold,
                silver: updateProject.earnedSilver - project.earnedSilver,
                bronze: updateProject.earnedBronze - project.earnedBronze,
              },
            },
            points:
              Math.round(
                (Number(updateProject.points) -
                  Number(project.points) +
                  Number.EPSILON) *
                  100,
              ) / 100,
          },
        },
      };
    }

    return {
      data: {
        project: findProjectWithStack,
        changes: {
          new: false,
          progress: {
            old: findProjectWithStack.progress,
            new: findProjectWithStack.progress,
          },
          trophies: {
            defined: {
              platinum: 0,
              gold: 0,
              silver: 0,
              bronze: 0,
            },
            earned: {
              platinum: 0,
              gold: 0,
              silver: 0,
              bronze: 0,
            },
          },
          points: 0,
        },
      },
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
    };
  }
};
