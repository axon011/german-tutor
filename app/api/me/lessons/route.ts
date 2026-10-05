import { requireUser } from "@/lib/api/http";
import { getLessonProgress } from "@/lib/db/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → { progress: Record<lessonId, LessonEntry> }. */
export async function GET() {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;
  return Response.json({ progress: await getLessonProgress(userId) });
}
