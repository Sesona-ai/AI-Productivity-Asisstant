import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, ListChecks, MessageSquare, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "A simple AI-powered workspace: generate professional emails, summarize meeting notes, plan tasks and chat with a workplace assistant.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Generate emails, summarize meeting notes, plan tasks and get workplace help — all in one simple AI dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const FEATURES = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    description:
      "Draft professional emails in seconds. Choose a tone, add your details, and get a ready-to-edit email.",
  },
  {
    to: "/summarizer",
    icon: FileText,
    title: "Meeting Notes Summarizer",
    description:
      "Paste raw meeting notes and get a clear summary with key decisions, action items and deadlines.",
  },
  {
    to: "/planner",
    icon: ListChecks,
    title: "AI Task Planner",
    description:
      "Turn a messy task list into an organized daily or weekly plan with priorities and time estimates.",
  },
  {
    to: "/chatbot",
    icon: MessageSquare,
    title: "Workplace Chatbot",
    description:
      "Ask for help with workplace communication, writing, task organization and meeting preparation.",
  },
] as const;

function Dashboard() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          AI Workplace Productivity Assistant
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Your simple AI-powered workspace. Generate professional emails, summarize
          meeting notes, plan your tasks, and chat with an assistant that helps you
          work smarter.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-foreground">
                {feature.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open tool
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <AiDisclaimer />
        </div>
      </div>
    </AppLayout>
  );
}
