export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const [appSettings, profile] = await Promise.all([
    prisma.appSettings.findUnique({
      select: { overlaysEnabled: true },
      where: { appId: "app" },
    }),
    prisma.profile.findUnique({
      select: {
        id: true,
        lastFullUpdateAt: true,
        overlay: {
          select: {
            id: true,
            project: {
              select: {
                stackId: true,
              },
            },
            lastLiveAt: true,
            updateProject: true,
            updateTrophies: true,
          },
        },
      },
      where: { userId: session.user.id },
    }),
  ]);

  if (!appSettings) {
    return {
      data: {
        success: false,
        message: "App settings not found",
      },
    };
  }

  if (!appSettings.overlaysEnabled) {
    return {
      data: {
        success: false,
        message: "Overlay creation is currently disabled",
      },
    };
  }

  if (!profile) {
    return {
      data: {
        success: false,
        message: "Profile not found",
      },
    };
  }

  if (!profile.lastFullUpdateAt) {
    return {
      data: {
        success: false,
        message: "Please wait for the initial update to finish first",
      },
    };
  }

  if (!profile.overlay) {
    const createOverlay = await prisma.overlay.create({
      data: {
        profileId: profile.id,
      },
    });

    return {
      data: {
        success: true,
        message: "URL successfully generated",
        overlay: createOverlay.id,
      },
    };
  }

  await prisma.overlay.delete({
    where: {
      id: profile.overlay.id,
    },
  });

  const createOverlay = await prisma.overlay.create({
    data: {
      profileId: profile.id,
      lastLiveAt: profile.overlay.lastLiveAt,
      updateProject: profile.overlay.updateProject,
      updateTrophies: profile.overlay.updateTrophies,
    },
  });

  if (profile.overlay.project) {
    await prisma.project.update({
      where: {
        profileId_stackId: {
          profileId: profile.id,
          stackId: profile.overlay.project.stackId,
        },
      },
      data: {
        overlayId: createOverlay.id,
      },
    });
  }

  return {
    data: {
      success: true,
      message: "New overlay successfully generated",
      overlay: createOverlay.id,
    },
  };
});
