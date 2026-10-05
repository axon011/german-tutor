/**
 * Accounts are optional. Sign-in exists only when every piece it needs is
 * configured; otherwise the app is guest-only and the sign-in button is never
 * rendered. Kept free of next-auth imports so a page can ask cheaply.
 */
export function isAuthEnabled(): boolean {
  return Boolean(
    process.env.AUTH_SECRET &&
      process.env.AUTH_GITHUB_ID &&
      process.env.AUTH_GITHUB_SECRET &&
      process.env.DATABASE_URL,
  );
}
