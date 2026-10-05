/**
 * Request schemas for the signed-in API (/api/me/*). Every string and array
 * is capped: these routes write straight into Postgres on behalf of a user,
 * so a payload's size is bounded here, before it reaches a query.
 */

import { z } from "zod";
import { ERROR_TYPES } from "../corrector";
import { getFocusEntry } from "../focus";
import { CEFR_LEVELS } from "../tutor-prompt";

export const MAX_APPEND_ERRORS = 50;
export const MAX_IMPORT_ERRORS = 2000;
export const MAX_IMPORT_CARDS = 2000;
export const MAX_IMPORT_LESSONS = 200;

/** Epoch ms inside the range a JS Date (and a Postgres timestamptz) holds. */
const epochMs = z.number().int().min(0).max(8_640_000_000_000_000);

const message = z.string().min(1).max(4000);
const span = z.string().max(500);
const correction = z.string().max(500);
const explanation = z.string().max(2000);
const level = z.enum(CEFR_LEVELS);
const errorType = z.enum(ERROR_TYPES);

export const errorRecordSchema = z.object({
  ts: epochMs,
  level,
  message,
  span,
  type: errorType,
  correction,
  explanation,
});

export const appendErrorsSchema = z.object({
  records: z.array(errorRecordSchema).min(1).max(MAX_APPEND_ERRORS),
});

/** A lesson or grammar-rule id the curriculum actually knows. */
export const lessonIdSchema = z
  .string()
  .min(1)
  .max(80)
  .refine((id) => getFocusEntry(id) !== undefined, "Unknown lesson id");

export const lessonActionSchema = z.object({ lessonId: lessonIdSchema });

export const reviewSchema = z.object({
  id: z.uuid(),
  quality: z.union([z.literal(0), z.literal(3), z.literal(5)]),
});

export const lessonEntrySchema = z.object({
  startedAt: epochMs,
  turns: z.number().int().min(0).max(100_000),
  completedAt: epochMs.optional(),
});

export const importCardSchema = z.object({
  sourceMessage: message,
  span: span.min(1),
  correction,
  explanation,
  type: errorType,
  level,
  ease: z.number().min(1.3).max(10),
  intervalDays: z.number().min(0).max(36_500),
  reps: z.number().int().min(0).max(100_000),
  lapses: z.number().int().min(0).max(100_000),
  dueAt: epochMs,
  createdAt: epochMs,
});

/**
 * One-time import of a guest's browser history. Lesson ids are only
 * length-checked here: an id the curriculum has since dropped is skipped by
 * the route, not allowed to fail the whole import.
 */
export const importSchema = z.object({
  errors: z.array(errorRecordSchema).max(MAX_IMPORT_ERRORS),
  lessons: z
    .record(z.string().min(1).max(80), lessonEntrySchema)
    .refine(
      (o) => Object.keys(o).length <= MAX_IMPORT_LESSONS,
      `At most ${MAX_IMPORT_LESSONS} lessons`,
    ),
  srsCards: z.array(importCardSchema).max(MAX_IMPORT_CARDS),
});

export type ImportPayload = z.infer<typeof importSchema>;
export type ImportCard = z.infer<typeof importCardSchema>;
