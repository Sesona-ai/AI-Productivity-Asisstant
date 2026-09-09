import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Check, RefreshCw, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { generateEmail } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator | AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Generate professional workplace emails from a short purpose and key details, in a formal, friendly or persuasive tone.",
      },
      { property: "og:title", content: "Smart Email Generator" },
      {
        property: "og:description",
        content: "Draft professional workplace emails in seconds with AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;
type Tone = (typeof TONES)[number];

function EmailPage() {
  const runGenerate = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState<Tone>("Formal");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasOutput = subject !== "" || body !== "";

  async function handleGenerate() {
    if (!purpose.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await runGenerate({
        data: { purpose: purpose.trim(), details: details.trim(), tone },
      });
      if (res.email) {
        setSubject(res.email.subject);
        setBody(res.email.body);
      } else {
        setError("The AI could not generate an email. Please try again.");
      }
    } catch {
      setError("Something went wrong while generating the email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    const text = `Subject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Smart Email Generator
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Describe the purpose and key details, pick a tone, and get a professional
          draft you can edit.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <label className="block text-sm font-medium text-foreground">
              Email purpose <span className="text-destructive">*</span>
            </label>
            <input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Follow up on a project proposal"
              className={cn(inputClass, "mt-1.5")}
            />

            <label className="mt-4 block text-sm font-medium text-foreground">
              Important details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Sent the proposal last Tuesday, need feedback before Friday"
              rows={4}
              className={cn(inputClass, "mt-1.5 resize-y")}
            />

            <label className="mt-4 block text-sm font-medium text-foreground">Tone</label>
            <div className="mt-1.5 flex gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    tone === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background text-muted-foreground hover:bg-accent",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!purpose.trim() || loading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Generating..." : "Generate Email"}
            </button>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </div>

          {/* Output */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Generated email</h2>
              {hasOutput && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                    Regenerate
                  </button>
                </div>
              )}
            </div>

            {hasOutput ? (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Subject
                  </label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={cn(inputClass, "mt-1")}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Body</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={12}
                    className={cn(inputClass, "mt-1 resize-y leading-relaxed")}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3 flex h-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                {loading
                  ? "Drafting your email..."
                  : "Your generated email will appear here."}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <AiDisclaimer />
        </div>
      </div>
    </AppLayout>
  );
}
