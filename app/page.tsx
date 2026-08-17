import { AppShell } from "@/components/AppShell";

export default function Home() {
  return (
    <main className="app-backdrop flex h-dvh flex-col items-center sm:p-6">
      <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white/80 backdrop-blur-sm sm:rounded-2xl sm:border sm:border-stone-200 sm:shadow-xl dark:bg-gray-950/70 dark:sm:border-gray-800">
        <div
          aria-hidden="true"
          className="brand-stripe h-[3px] w-full shrink-0"
        />
        <AppShell />
      </div>
    </main>
  );
}
