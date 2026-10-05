import { authEnabled, handlers } from "@/lib/auth";

export const runtime = "nodejs";

/** Guest-only deployment: the auth endpoints simply do not exist. */
function disabled() {
  return Response.json({ error: "Accounts are not enabled" }, { status: 404 });
}

export const GET = authEnabled ? handlers.GET : disabled;
export const POST = authEnabled ? handlers.POST : disabled;
