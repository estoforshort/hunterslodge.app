export default defineNuxtRouteMiddleware(() => {
  const { user } = useUserSession();

  if (!user.value) {
    return navigateTo("/");
  }
});
