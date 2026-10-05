"use client";

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ImportPayload } from "@/lib/api/schemas";
import { readErrorLog } from "@/lib/error-log";
import { readLessonProgress } from "@/lib/lesson-progress";
import { getLocalStore, setStore } from "@/lib/store";
import {
  buildImportPayload,
  importFlagKey,
  isEmptyImport,
} from "@/lib/store/import";
import { readCards } from "@/lib/store/local";
import { importToAccount, RemoteStore } from "@/lib/store/remote";

/**
 * Optional accounts. With auth disabled this renders its children and
 * nothing else — no session fetch, no provider — so a guest-only deployment
 * is byte-for-byte the guest experience.
 */
export function AccountProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <StoreSync />
      {children}
    </SessionProvider>
  );
}

/**
 * Points the app's ProgressStore at the account once a session resolves, and
 * back at the browser on sign-out. Until the session is known the browser
 * store stays current, so a guest never waits on the network.
 */
function StoreSync() {
  const { data, status } = useSession();
  const userId = data?.user?.id;

  useEffect(() => {
    if (status === "loading") return;
    setStore(userId ? new RemoteStore() : getLocalStore());
  }, [status, userId]);

  return null;
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/** Header slot: SIGN IN for guests, an avatar with a small menu once signed in. */
export function AccountControl() {
  const { data, status } = useSession();

  // Same footprint as the avatar, so the header doesn't jump on resolve.
  if (status === "loading") {
    return <span aria-hidden="true" className="block h-8 w-8 shrink-0" />;
  }

  if (!data?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn("github")}
        className="pressable focus-ring font-display border-ink text-ink hover:bg-gold hover:text-gold-ink inline-flex shrink-0 items-center gap-1.5 rounded-sm border-2 px-2 py-1 text-[10px] font-semibold tracking-[0.12em] whitespace-nowrap uppercase"
      >
        <GitHubMark className="h-3.5 w-3.5" />
        Sign in
      </button>
    );
  }

  return <AccountMenu key={data.user.id} user={data.user} />;
}

function AccountMenu({
  user,
}: {
  user: { name?: string | null; login?: string; image?: string | null };
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const handle = user.login ? `@${user.login}` : (user.name ?? "Account");

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Deliberately not `relative`: the panel anchors to the app shell's top
  // chrome (header + import banner), so it opens below the banner and can never
  // cover the banner's buttons. `right` re-derives the header row's max-w-2xl /
  // px-4 edge so the panel still lines up under the avatar.
  return (
    <div ref={rootRef} className="shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${handle}`}
        onClick={() => setOpen((v) => !v)}
        className={`pressable focus-ring bg-surface block h-8 w-8 overflow-hidden rounded-sm border-2 ${
          open ? "border-gold" : "border-ink/25 hover:border-ink"
        }`}
      >
        {user.image ? (
          // GitHub serves the avatar pre-sized; it doesn't need the optimizer.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-display flex h-full w-full items-center justify-center text-xs font-bold uppercase">
            {handle.replace("@", "").slice(0, 1)}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="border-ink bg-surface shadow-hard absolute top-full right-[max(1rem,calc((100%_-_42rem)/2_+_1rem))] z-30 mt-2 w-52 rounded-sm border-2"
        >
          <div className="border-line border-b px-3 py-2.5">
            <p className="kicker text-muted text-[9px]">Signed in</p>
            <p className="font-display mt-0.5 truncate text-sm font-bold">
              {handle}
            </p>
            <p className="text-muted mt-1 text-xs leading-snug">
              Progress syncs to your account.
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut()}
            className="focus-ring font-display hover:bg-gold hover:text-gold-ink w-full px-3 py-2.5 text-left text-[11px] font-semibold tracking-[0.12em] uppercase"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function importPrompt(p: ImportPayload): string {
  const n = p.errors.length;
  const mistakes = `${n} ${n === 1 ? "mistake" : "mistakes"}`;
  const hasLessons = Object.keys(p.lessons).length > 0;
  if (n > 0 && hasLessons) {
    return `Import ${mistakes} and your lesson progress from this browser?`;
  }
  if (n > 0) return `Import ${mistakes} from this browser?`;
  if (hasLessons) return "Import your lesson progress from this browser?";
  return "Import your review deck from this browser?";
}

function setFlag(userId: string, value: string) {
  try {
    window.localStorage.setItem(importFlagKey(userId), value);
  } catch {
    // Private mode — the banner simply comes back next visit.
  }
}

/**
 * Shown once per user per browser after sign-in, if this browser holds guest
 * history: move it into the account, or don't. Either answer is remembered
 * under `dt-imported:<userId>`.
 */
export function ImportBanner() {
  const { data } = useSession();
  const userId = data?.user?.id;
  const [payload, setPayload] = useState<ImportPayload | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "failed">("idle");

  useEffect(() => {
    let flagged = true;
    if (userId) {
      try {
        flagged = window.localStorage.getItem(importFlagKey(userId)) !== null;
      } catch {
        flagged = true;
      }
    }
    const next = flagged
      ? null
      : buildImportPayload(readErrorLog(), readLessonProgress(), readCards());
    // One-time sync from an external store (localStorage) per signed-in user.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPayload(next && !isEmptyImport(next) ? next : null);
  }, [userId]);

  if (!userId || !payload) return null;

  async function runImport() {
    if (!userId || !payload) return;
    setState("busy");
    try {
      await importToAccount(payload);
      setFlag(userId, "imported");
      setPayload(null);
    } catch {
      setState("failed");
    }
  }

  function dismiss() {
    if (!userId) return;
    setFlag(userId, "dismissed");
    setPayload(null);
  }

  return (
    <div
      role="region"
      aria-label="Import browser history"
      className="border-line bg-surface shrink-0 border-b-2"
    >
      <div className="border-l-gold mx-auto flex w-full max-w-2xl flex-wrap items-center gap-x-4 gap-y-2 border-l-[3px] px-4 py-2.5">
        <p className="text-ink min-w-0 flex-1 text-sm leading-snug">
          {importPrompt(payload)}
          {state === "failed" && (
            <span className="text-danger"> Import failed — try again.</span>
          )}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={runImport}
            disabled={state === "busy"}
            className="btn-hard btn-hard-primary focus-ring px-3 py-1.5 text-[11px] tracking-[0.12em] uppercase"
          >
            {state === "busy" ? "Importing…" : "Import"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            disabled={state === "busy"}
            className="pressable focus-ring font-display text-muted hover:text-ink text-[11px] font-semibold tracking-[0.12em] uppercase"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
