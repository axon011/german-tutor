import { auth } from "@/lib/auth";
import { readBody, requireUser } from "@/lib/api/http";
import { lessonActionSchema } from "@/lib/api/schemas";
import { bumpActivity } from "@/lib/db/path";
import { recordLessonTurn } from "@/lib/db/progress";
import { isBetaLogin } from "@/lib/path/beta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { lessonId, day? } → { entry: LessonEntry } after counting one turn.
 * Serves everyone; only beta users also get the turn counted toward `day`'s
 * activity (the learning path's streak).
 */
export async function POST(req: Request) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;
  const body = await readBody(req, lessonActionSchema, 1_000);
  if (body instanceof Response) return body;
  const entry = await recordLessonTurn(userId, body.lessonId);
  if (body.day) {
    const login = (await auth())?.user?.login;
    if (isBetaLogin(login)) await bumpActivity(userId, body.day, { turns: 1 });
  }
  return Response.json({ entry });
}
