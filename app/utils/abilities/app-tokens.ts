import type { User } from "#auth-utils";

export const updateTokens = defineAbility((user: User) => {
  return user.isAdmin;
});
