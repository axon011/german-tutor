import { readBody, requireUser } from "@/lib/api/http";
import { lessonActionSchema } from "@/lib/api/schemas";
import { startLesson } from "@/lib/db/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { lessonId } → { ok: true }. No-op for a lesson already started. */
export async function POST(req: Request) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;
  const body = await readBody(req, lessonActionSchema, 1_000);
  if (body instanceof Response) return body;
  await startLesson(userId, body.lessonId);
  return Response.json({ ok: true });
}
