import { AppTokenAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";

const config = useRuntimeConfig();

const authProvider = new AppTokenAuthProvider(
  config.oauth.twitch.clientId,
  config.oauth.twitch.clientSecret,
);

const twitch = new ApiClient({ authProvider });
export default twitch;
