export default defineNuxtRouteMiddleware(() => {
  const { user } = useUserSession();

  if (!user.value || !user.value.isAdmin) {
    return navigateTo("/");
  }
});
