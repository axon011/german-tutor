import { requireUser } from "@/lib/api/http";
import { listDueCards } from "@/lib/db/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → { cards: SrsCard[] } due now (server clock), most overdue first. */
export async function GET() {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;
  return Response.json({ cards: await listDueCards(userId, Date.now()) });
}
