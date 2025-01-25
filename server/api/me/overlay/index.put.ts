import { z } from "zod";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (!session.user.profileId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const style = ["default", "streamer"] as const;

  const bodySchema = z.object({
    stackId: z.string().min(1).optional(),
    style: z.enum(style),
    showProject: z.boolean(),
    updateProject: z.boolean(),
    updateTrophies: z.boolean(),
  });

  const body = await readValidatedBody(event, bodySchema.parse);

  const overlay = await prisma.overlay.findFirst({
    select: {
      id: true,
      profileId: true,
      project: {
        select: {
          stackId: true,
        },
      },
    },
    where: { profile: { userId: session.user.id } },
  });

  if (overlay) {
    if (body.stackId && body.showProject) {
      if (overlay.project) {
        if (overlay.project.stackId !== body.stackId) {
          await prisma.project.update({
            where: {
              profileId_stackId: {
                profileId: overlay.profileId,
                stackId: overlay.project.stackId,
              },
            },
            data: {
              overlayId: null,
            },
          });

          await prisma.project.update({
            where: {
              profileId_stackId: {
                profileId: overlay.profileId,
                stackId: body.stackId,
              },
            },
            data: {
              overlayId: overlay.id,
            },
          });
        }
      } else {
        await prisma.project.update({
          where: {
            profileId_stackId: {
              profileId: overlay.profileId,
              stackId: body.stackId,
            },
          },
          data: {
            overlayId: overlay.id,
          },
        });
      }
    } else {
      if (overlay.project) {
        await prisma.project.update({
          where: {
            profileId_stackId: {
              profileId: overlay.profileId,
              stackId: overlay.project.stackId,
            },
          },
          data: {
            overlayId: null,
          },
        });
      }
    }

    await prisma.overlay.update({
      where: {
        id: overlay.id,
      },
      data: {
        style: body.style,
        showProject: body.showProject,
        updateProject: body.updateProject,
        updateTrophies: body.updateTrophies,
      },
    });
  }

  return true;
});
