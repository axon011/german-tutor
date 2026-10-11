import { readBody, requireBetaUser } from "@/lib/api/http";
import { wordReviewSchema } from "@/lib/api/schemas";
import { reviewWord } from "@/lib/db/path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { id, quality: 0|3|5, day } → { ok: true }; 404 if not the user's card. */
export async function POST(req: Request) {
  const userId = await requireBetaUser();
  if (userId instanceof Response) return userId;
  const body = await readBody(req, wordReviewSchema, 1_000);
  if (body instanceof Response) return body;
  const found = await reviewWord(
    userId,
    body.id,
    body.quality,
    Date.now(),
    body.day,
  );
  if (!found)
    return Response.json({ error: "Card not found" }, { status: 404 });
  return Response.json({ ok: true });
}
