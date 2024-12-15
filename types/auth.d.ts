declare module "#auth-utils" {
  interface User {
    id: string;
    username: string;
    displayName: string;
    isAdmin: boolean;
    profileId: number | null;
  }
}
export {};
