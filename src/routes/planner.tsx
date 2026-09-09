import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Clock, CalendarClock } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { planTasks } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner | AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Turn a task list into an organized daily or weekly plan with priorities, durations and suggested times.",
      },
      { property: "og:title", content: "AI Task Planner" },
      {
        property: "og:description",
        content: "Organize your tasks into a realistic daily or weekly plan with AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerPage,
});

type PlannedTask = {
  task: string;
  priority: "High" | "Medium" | "Low";
  estimatedDuration: string;
  suggestedTime: string;
};

const PRIORITY_STYLES: Record<PlannedTask["priority"], string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-chart-4/15 text-chart-3",
  Low: "bg-chart-2/10 text-chart-2",
};

function PlannerPage() {
  const runPlan = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [scope, setScope] = useState<"Daily" | "Weekly">("Daily");
  const [plan, setPlan] = useState<PlannedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePlan() {
    if (!tasks.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await runPlan({ data: { tasks: tasks.trim(), scope } });
      setPlan(res.plan);
      if (res.plan.length === 0) {
        setError("The AI could not create a plan. Please try again.");
      }
    } catch {
      setError("Something went wrong while planning. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          AI Task Planner
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your tasks and get an organized plan with priorities and time
          estimates.
        </p>

        <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
          <label className="block text-sm font-medium text-foreground">
            Your tasks <span className="text-destructive">*</span>
          </label>
          <textarea
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
            placeholder={"Enter one task per line, e.g.\nPrepare slides for team meeting\nReply to client emails\nReview budget report"}
            rows={6}
            className="mt-1.5 w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <label className="mt-4 block text-sm font-medium text-foreground">
            Plan scope
          </label>
          <div className="mt-1.5 flex gap-2">
            {(["Daily", "Weekly"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-6",
                  scope === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background text-muted-foreground hover:bg-accent",
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={handlePlan}
            disabled={!tasks.trim() || loading}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Planning..." : "Plan Tasks"}
          </button>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>

        {plan.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground">
                Your {scope.toLowerCase()} plan
              </h2>
            </div>
            <div className="hidden grid-cols-[1fr_96px_130px_130px] gap-4 border-b border-border bg-muted/50 px-5 py-2.5 text-xs font-medium text-muted-foreground sm:grid">
              <span>Task</span>
              <span>Priority</span>
              <span>Est. Duration</span>
              <span>Suggested Time</span>
            </div>
            <ul className="divide-y divide-border">
              {plan.map((item, i) => (
                <li
                  key={i}
                  className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_96px_130px_130px] sm:items-center sm:gap-4"
                >
                  <span className="text-sm font-medium text-foreground">{item.task}</span>
                  <span>
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                        PRIORITY_STYLES[item.priority] ?? "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.priority}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {item.estimatedDuration}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                    {item.suggestedTime}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <AiDisclaimer />
        </div>
      </div>
    </AppLayout>
  );
}
