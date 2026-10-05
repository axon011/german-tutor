import { readBody, requireUser } from "@/lib/api/http";
import { importSchema } from "@/lib/api/schemas";
import { importHistory } from "@/lib/db/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { errors, lessons, srsCards } → counts of what was imported/skipped.
 * One-time move of a guest's browser history into the account; idempotent,
 * so a retried or repeated import never duplicates rows.
 */
export async function POST(req: Request) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;
  const body = await readBody(req, importSchema, 4_000_000);
  if (body instanceof Response) return body;
  return Response.json(await importHistory(userId, body));
}
