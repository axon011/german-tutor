/**
 * Postgres schema (slice 3). The four Auth.js tables follow the
 * @auth/drizzle-adapter Postgres shapes exactly — the adapter reads them by
 * column name, so do not rename. The app tables mirror the localStorage
 * records in lib/error-log.ts and lib/lesson-progress.ts one-to-one, so the
 * ProgressStore swap is a transport change, not a data-model change.
 */

import type { AdapterAccountType } from "next-auth/adapters";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ── Auth.js ────────────────────────────────────────────────────────────────

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// Kept for adapter parity (WebAuthn); unused until passkeys are switched on.
export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (a) => [primaryKey({ columns: [a.userId, a.credentialID] })],
);

// ── Learner data ───────────────────────────────────────────────────────────

/** One row per Corrector error — the server-side twin of ErrorRecord. */
export const errorRecords = pgTable(
  "error_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ts: timestamp("ts", { withTimezone: true, mode: "date" }).notNull(),
    level: varchar("level", { length: 2 }).notNull(),
    message: text("message").notNull(),
    span: text("span").notNull(),
    type: varchar("type", { length: 16 }).notNull(),
    correction: text("correction").notNull(),
    explanation: text("explanation").notNull(),
  },
  (t) => [index("error_records_user_ts_idx").on(t.userId, t.ts)],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    turns: integer("turns").notNull().default(0),
    completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

/** SM-2 review state for one distinct mistake (see lib/srs.ts). */
export const srsCards = pgTable(
  "srs_cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sourceMessage: text("source_message").notNull(),
    span: text("span").notNull(),
    correction: text("correction").notNull(),
    explanation: text("explanation").notNull(),
    type: varchar("type", { length: 16 }).notNull(),
    level: varchar("level", { length: 2 }).notNull(),
    ease: real("ease").notNull().default(2.5),
    intervalDays: real("interval_days").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    dueAt: timestamp("due_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("srs_cards_user_mistake_uq").on(
      t.userId,
      t.sourceMessage,
      t.span,
    ),
    index("srs_cards_user_due_idx").on(t.userId, t.dueAt),
  ],
);
