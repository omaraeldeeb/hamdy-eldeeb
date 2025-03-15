import { DefaultSession } from "next-auth";

/// This file is used to extend the NextAuth session type to include the user role not editing or overwriting it
declare module "next-auth" {
  export interface Session {
    user: {
      role: string;
    } & DefaultSession["user"];
  }
}
