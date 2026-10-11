import { requireBetaUser } from "@/lib/api/http";
import { listDueWords } from "@/lib/db/path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/** GET ?limit=20 → { cards: WordCard[] } due now (server clock), most overdue first. */
export async function GET(req: Request) {
  const userId = await requireBetaUser();
  if (userId instanceof Response) return userId;
  const raw = Number(new URL(req.url).searchParams.get("limit"));
  const limit = Number.isFinite(raw) && raw > 0
    ? Math.min(MAX_LIMIT, Math.max(1, Math.floor(raw)))
    : DEFAULT_LIMIT;
  return Response.json({
    cards: await listDueWords(userId, Date.now(), limit),
  });
}
