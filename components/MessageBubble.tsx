import type { ChatMessage } from "@/lib/llm/provider";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-blue-600 text-white"
            : "rounded-bl-sm bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
