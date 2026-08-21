import { AppShell } from "@/components/AppShell";

export default function Home() {
  return (
    // A shell pinned to exactly one viewport height. Phones get the full-bleed
    // app; from `lg` up the same column becomes a framed panel — 2px rule, hard
    // offset shadow — printed onto a slightly deeper ground, so a wide window
    // doesn't read as empty space around a stray strip of content.
    <main className="app-backdrop flex h-dvh flex-col overflow-hidden">
      <div aria-hidden="true" className="brand-stripe h-[6px] w-full shrink-0" />
      <div className="bg-background lg:border-ink/20 lg:shadow-hard-lg flex min-h-0 w-full flex-1 flex-col overflow-hidden lg:mx-auto lg:my-8 lg:max-w-2xl lg:rounded-sm lg:border-2">
        <AppShell />
      </div>
    </main>
  );
}
