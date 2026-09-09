import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiDisclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-lg border border-border bg-muted/50 p-3",
        compact ? "text-[11px] leading-snug" : "text-xs leading-relaxed sm:text-sm",
      )}
      role="note"
    >
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">Responsible AI:</span>{" "}
        AI-generated content may contain errors. Always review AI outputs before using
        them. Do not enter confidential, private or sensitive company information. The
        AI must not invent missing information.
      </p>
    </div>
  );
}
