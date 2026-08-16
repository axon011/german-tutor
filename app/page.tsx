import { Chat } from "@/components/Chat";

export default function Home() {
  return (
    <main className="flex h-dvh flex-col items-center">
      <header className="w-full max-w-2xl px-4 pt-6">
        <h1 className="text-lg font-semibold">Deutsch-Tutor</h1>
        <p className="text-sm text-gray-500">B1 → B2, ein Gespräch nach dem anderen</p>
      </header>
      <Chat />
    </main>
  );
}
