import type { ChatMessage } from "@/lib/llm/provider";
import { LogoMark } from "./LogoMark";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={`animate-message-in flex items-end gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && <LogoMark className="h-7 w-7 text-[10px]" />}
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-slate-800 text-white dark:bg-indigo-500 dark:text-white"
            : "rounded-bl-sm bg-stone-100 text-stone-900 dark:bg-gray-800 dark:text-gray-100"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
