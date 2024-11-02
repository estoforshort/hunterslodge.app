import type { User } from "#auth-utils";

export const updateSettings = defineAbility((user: User) => {
  return user.isAdmin;
});
