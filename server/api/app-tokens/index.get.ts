import { updateTokens } from "~/utils/abilities/app-tokens";

export default defineEventHandler(async (event) => {
  await authorize(event, updateTokens);

  const data = await prisma.appTokens.findUniqueOrThrow({
    select: {
      expiresAt: true,
      refreshTokenExpiresAt: true,
      updatedAt: true,
    },
    where: { appId: "app" },
  });

  return { data };
});
