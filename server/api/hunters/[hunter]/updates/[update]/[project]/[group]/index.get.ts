import { z } from "zod";

export default defineEventHandler(async (event) => {
  const paramsSchema = z.object({
    hunter: z.string().min(1).max(25),
    update: z.number({ coerce: true }).positive().int().max(4294967295),
    project: z.string().min(1).max(36),
    group: z.string().length(3),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const data = await prisma.projectGroupChange.findUnique({
    select: {
      trophyChanges: {
        select: {
          stackId: true,
          groupId: true,
          trophyId: true,
          projectTrophy: {
            select: {
              stackTrophy: {
                select: {
                  gameTrophy: {
                    select: {
                      type: true,
                      name: true,
                      description: true,
                    },
                  },
                },
              },
              streamId: true,
            },
          },
          pointsFrom: true,
          pointsTo: true,
          createdAt: true,
        },
        orderBy: {
          trophyId: "asc",
        },
      },
    },
    where: {
      updateId_stackId_groupId: {
        updateId: params.update,
        stackId: params.project,
        groupId: params.group,
      },
    },
  });

  return { data: data?.trophyChanges ?? [] };
});
