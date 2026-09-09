import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { summarizeNotes } from "@/lib/ai.functions";

export const Route = createFileRoute("/summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer | AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Paste meeting notes and get a clear AI summary with key decisions, action items and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      {
        property: "og:description",
        content: "Turn raw meeting notes into clear summaries, decisions and action items.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SummarizerPage,
});

type SummaryResult = {
  summary: string;
  keyDecisions: string[];
  actionItems: string[];
  deadlines: string[];
};

function ListSection({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-sm text-foreground">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2.5 text-sm text-muted-foreground">{emptyText}</p>
      )}
    </div>
  );
}

function SummarizerPage() {
  const runSummarize = useServerFn(summarizeNotes);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSummarize() {
    if (!notes.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await runSummarize({ data: { notes: notes.trim() } });
      if (res.result) {
        setResult(res.result);
      } else {
        setError("The AI could not summarize these notes. Please try again.");
      }
    } catch {
      setError("Something went wrong while summarizing. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Meeting Notes Summarizer
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Paste your raw meeting notes below and get a structured summary.
        </p>

        <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
          <label className="block text-sm font-medium text-foreground">
            Meeting notes <span className="text-destructive">*</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your meeting notes here..."
            rows={10}
            className="mt-1.5 w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSummarize}
            disabled={!notes.trim() || loading}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Summarizing..." : "Summarize"}
          </button>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Summary</h3>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-foreground">
                {result.summary}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ListSection
                title="Key Decisions"
                items={result.keyDecisions}
                emptyText="No decisions were found in the notes."
              />
              <ListSection
                title="Action Items"
                items={result.actionItems}
                emptyText="No action items were found in the notes."
              />
            </div>
            <ListSection
              title="Deadlines"
              items={result.deadlines}
              emptyText="No deadlines were mentioned in the notes."
            />
          </div>
        )}

        <div className="mt-6">
          <AiDisclaimer />
        </div>
      </div>
    </AppLayout>
  );
}
