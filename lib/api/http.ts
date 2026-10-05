/**
 * Shared plumbing for the /api/me/* route handlers: who is asking, and what
 * did they send. Both return either the value or a ready-made error Response,
 * so a handler reads as a straight line.
 */

import type { z } from "zod";
import { getUserId } from "../auth";

export async function requireUser(): Promise<string | Response> {
  const userId = await getUserId();
  return userId ?? Response.json({ error: "Not signed in" }, { status: 401 });
}

/**
 * Read and validate a JSON body. The byte cap is checked on the raw text
 * before parsing, so an oversized body is never materialised as objects.
 */
export async function readBody<S extends z.ZodType>(
  req: Request,
  schema: S,
  maxBytes: number,
): Promise<z.infer<S> | Response> {
  let text: string;
  try {
    text = await req.text();
  } catch {
    return Response.json({ error: "Unreadable body" }, { status: 400 });
  }
  if (text.length > maxBytes) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", issues: parsed.error.issues.length },
      { status: 400 },
    );
  }
  return parsed.data;
}
