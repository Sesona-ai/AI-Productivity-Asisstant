import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Bot, User } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chatbot")({
  head: () => ({
    meta: [
      { title: "Workplace Chatbot | AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Chat with an AI assistant for help with workplace communication, writing, task organization and meeting preparation.",
      },
      { property: "og:title", content: "Workplace Chatbot" },
      {
        property: "og:description",
        content: "Get AI help with workplace communication, writing, tasks and meetings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatbotPage,
});

const SUGGESTIONS = [
  "Help me write a polite follow-up message to my manager",
  "How should I prepare for a performance review meeting?",
  "Help me organize my tasks for today",
  "Tips for saying no to extra work professionally",
];

function ChatbotPage() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, status]);

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  async function handleSend(text?: string) {
    const value = (text ?? input).trim();
    if (!value || isLoading) return;
    setInput("");
    await sendMessage({ text: value });
  }

  return (
    <AppLayout>
      <div className="mx-auto flex h-[calc(100vh-7.5rem)] max-w-3xl flex-col md:h-[calc(100vh-4rem)]">
        <div className="shrink-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Workplace Chatbot
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Ask for help with communication, writing, task organization, meeting prep
            and productivity.
          </p>
        </div>

        <div
          ref={scrollRef}
          className="mt-4 flex-1 space-y-4 overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-6 w-6" />
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">
                Hi! I can help with workplace communication, writing, task organization
                and meeting preparation. Try one of these:
              </p>
              <div className="flex max-w-md flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isUser = message.role === "user";
                const text = message.parts
                  .map((part) => (part.type === "text" ? part.text : ""))
                  .join("");
                if (!text) return null;
                return (
                  <div
                    key={message.id}
                    className={cn("flex gap-3", isUser && "flex-row-reverse")}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div
                      className={cn(
                        "max-w-[80%] whitespace-pre-wrap rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {text}
                    </div>
                  </div>
                );
              })}
              {status === "submitted" && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                    Thinking...
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {error && (
          <p className="mt-2 shrink-0 text-sm text-destructive">
            Something went wrong. Please try sending your message again.
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-3 flex shrink-0 gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message... (Enter to send)"
            rows={1}
            autoFocus
            className="max-h-32 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-3 shrink-0">
          <AiDisclaimer compact />
        </div>
      </div>
    </AppLayout>
  );
}
