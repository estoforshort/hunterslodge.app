import { z } from "zod";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (!session.user.isAdmin) {
    return {
      data: {
        success: false,
        message: "You need to be an admin for this",
      },
    };
  }

  const paramsSchema = z.object({
    update: z.number({ coerce: true }).positive().int().max(4294967295),
  });

  const params = await getValidatedRouterParams(event, paramsSchema.parse);

  const findUpdate = await prisma.update.findUnique({
    select: {
      id: true,
      status: true,
      type: true,
    },
    where: { id: params.update },
  });

  if (!findUpdate) {
    return {
      data: {
        success: false,
        message: "Couldn't find the update",
      },
    };
  }

  if (findUpdate.type !== "INITIAL" || findUpdate.status !== "FAILED") {
    return {
      data: {
        success: false,
        message: "Only failed initial updates can be requeued",
      },
    };
  }

  const updateUpdate = await prisma.update.update({
    where: { id: findUpdate.id },
    data: {
      status: "WAITING",
    },
  });

  await addJob({
    type: "UPDATE",
    update: { id: updateUpdate.id, type: updateUpdate.type },
  });

  return {
    data: {
      success: true,
      message: "Initial update successfully requeued",
    },
  };
});
