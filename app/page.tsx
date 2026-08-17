import { AppShell } from "@/components/AppShell";

export default function Home() {
  return (
    // Full-viewport app rather than a card floating on a backdrop: header at
    // the top, content in the middle, navigation at the bottom on phones.
    <main className="flex h-dvh flex-col overflow-hidden bg-[var(--background)]">
      <div aria-hidden="true" className="brand-stripe h-[3px] w-full shrink-0" />
      <AppShell />
    </main>
  );
}
