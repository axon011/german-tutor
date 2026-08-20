import { AppShell } from "@/components/AppShell";

export default function Home() {
  return (
    // A shell pinned to exactly one viewport height. Phones get the full-bleed
    // app; from `lg` up the same column becomes a framed panel floating on a
    // softly tinted backdrop, so a wide window doesn't read as empty space
    // around a stray strip of content.
    <main className="app-backdrop flex h-dvh flex-col overflow-hidden">
      <div aria-hidden="true" className="brand-stripe h-[3px] w-full shrink-0" />
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[var(--background)] lg:mx-auto lg:my-6 lg:max-w-2xl lg:rounded-2xl lg:border-2 lg:border-stone-200 lg:shadow-[0_10px_40px_-12px_rgba(28,25,23,0.25)] dark:lg:border-zinc-800 dark:lg:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]">
        <AppShell />
      </div>
    </main>
  );
}
