/**
 * Who sees the learning path (beta). An allow-list of GitHub logins in
 * PATH_BETA_LOGINS, read at call time so a Vercel env change needs no code
 * change. Unset or empty means nobody — the feature is dark by default.
 */
export function isBetaLogin(login: string | undefined | null): boolean {
  if (!login) return false;
  const allowed = (process.env.PATH_BETA_LOGINS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(login.trim().toLowerCase());
}
