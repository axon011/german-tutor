import { readBody, requireBetaUser } from "@/lib/api/http";
import { pathCheckSchema } from "@/lib/api/schemas";
import { getTodayState, recordCheck } from "@/lib/db/path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { lessonId, correct, total, day } → TodayState after recording the check. */
export async function POST(req: Request) {
  const userId = await requireBetaUser();
  if (userId instanceof Response) return userId;
  const body = await readBody(req, pathCheckSchema, 1_000);
  if (body instanceof Response) return body;
  await recordCheck(userId, body.lessonId, body.correct, body.day);
  return Response.json(await getTodayState(userId, body.day, Date.now()));
}
