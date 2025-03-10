// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;         // Required, matches Prisma User.id
      name: string;       // Required, matches your schema (not optional)
      email: string;      // Required, matches your schema (not optional)
    } & DefaultSession["user"]; // Includes optional image if needed
  }

  interface User {
    id: string;          // Required
    name: string;        // Required
    email: string;       // Required
    password?: string;   // Optional, not in session
  }

  interface JWT {
    id?: string;         // Optional in token, populated by callbacks
  }
}