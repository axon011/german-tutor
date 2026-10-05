/**
 * Auth.js v5: GitHub sign-in, users and accounts stored through the Drizzle
 * adapter, sessions as JWT cookies so an authenticated request costs no DB
 * round-trip. The config is built lazily per request, so importing this
 * module never touches DATABASE_URL — a build or a guest-only deployment
 * without the auth env vars works, and `authEnabled` tells the UI to hide
 * sign-in.
 */

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAuthEnabled } from "./auth-enabled";
import { getDb, schema } from "./db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      /** GitHub handle — `name` is the display name and may be unset. */
      login?: string;
    } & DefaultSession["user"];
  }
}

export const authEnabled = isAuthEnabled();

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  adapter: authEnabled
    ? DrizzleAdapter(getDb(), {
        usersTable: schema.users,
        accountsTable: schema.accounts,
        sessionsTable: schema.sessions,
        verificationTokensTable: schema.verificationTokens,
        authenticatorsTable: schema.authenticators,
      })
    : undefined,
  // GitHub reads AUTH_GITHUB_ID / AUTH_GITHUB_SECRET from the environment.
  providers: authEnabled ? [GitHub] : [],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user, profile }) {
      // `user` and `profile` are only present on the sign-in request.
      if (user?.id) token.sub = user.id;
      if (typeof profile?.login === "string") token.login = profile.login;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (typeof token.login === "string") session.user.login = token.login;
      return session;
    },
  },
}));

/** The signed-in user's id, or null for guests and when auth is disabled. */
export async function getUserId(): Promise<string | null> {
  if (!authEnabled) return null;
  try {
    const session = await auth();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
