declare module "#auth-utils" {
  interface User {
    id: string;
    username: string;
    displayName: string;
    isAdmin: boolean;
    isFounder: boolean;
    isLinked: boolean;
  }
}
export {};
