import { readBody, requireUser } from "@/lib/api/http";
import { lessonActionSchema } from "@/lib/api/schemas";
import { recordLessonTurn } from "@/lib/db/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { lessonId } → { entry: LessonEntry } after counting one turn. */
export async function POST(req: Request) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;
  const body = await readBody(req, lessonActionSchema, 1_000);
  if (body instanceof Response) return body;
  return Response.json({
    entry: await recordLessonTurn(userId, body.lessonId),
  });
}
