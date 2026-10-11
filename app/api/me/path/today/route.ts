import { requireBetaUser } from "@/lib/api/http";
import { daySchema } from "@/lib/api/schemas";
import { getTodayState } from "@/lib/db/path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?day=YYYY-MM-DD → TodayState (the learner's local day, from the client). */
export async function GET(req: Request) {
  const userId = await requireBetaUser();
  if (userId instanceof Response) return userId;
  const day = daySchema.safeParse(new URL(req.url).searchParams.get("day"));
  if (!day.success)
    return Response.json({ error: "Invalid day" }, { status: 400 });
  return Response.json(await getTodayState(userId, day.data, Date.now()));
}
