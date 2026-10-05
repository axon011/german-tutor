import { readBody, requireUser } from "@/lib/api/http";
import { appendErrorsSchema } from "@/lib/api/schemas";
import { appendErrors, listErrors } from "@/lib/db/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → { records: ErrorRecord[] }, oldest first. */
export async function GET() {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;
  return Response.json({ records: await listErrors(userId) });
}

/** POST { records: ErrorRecord[] } (1–50) → { ok: true }. */
export async function POST(req: Request) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;
  const body = await readBody(req, appendErrorsSchema, 256_000);
  if (body instanceof Response) return body;
  await appendErrors(userId, body.records);
  return Response.json({ ok: true });
}
