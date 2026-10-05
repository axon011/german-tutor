import { readBody, requireUser } from "@/lib/api/http";
import { reviewSchema } from "@/lib/api/schemas";
import { reviewCard } from "@/lib/db/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { id, quality: 0|3|5 } → { ok: true }; 404 if not the user's card. */
export async function POST(req: Request) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;
  const body = await readBody(req, reviewSchema, 1_000);
  if (body instanceof Response) return body;
  const found = await reviewCard(userId, body.id, body.quality, Date.now());
  if (!found)
    return Response.json({ error: "Card not found" }, { status: 404 });
  return Response.json({ ok: true });
}
