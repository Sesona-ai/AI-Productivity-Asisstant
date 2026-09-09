import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const MODEL_ID = "google/gemini-3.8-flash";

function getModel() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const gateway = createLovableAiGatewayProvider(key);
  return gateway(MODEL_ID);
}

const RESPONSIBLE_AI_RULES =
  "Never invent information that was not provided. Do not add names, dates, deadlines, facts or commitments that are missing from the input. If something important is missing, leave a short placeholder like [recipient name] or omit it.";

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        purpose: z.string().min(1),
        details: z.string(),
        tone: z.enum(["Formal", "Friendly", "Persuasive"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const { output } = await generateText({
        model: getModel(),
        output: Output.object({
          schema: z.object({
            subject: z.string(),
            body: z.string(),
          }),
        }),
        prompt: `You are a professional workplace email writer. ${RESPONSIBLE_AI_RULES}

Write a ${data.tone.toLowerCase()} workplace email.

Purpose of the email: ${data.purpose}

Important details to include: ${data.details || "(none provided)"}

Return a concise, professional email with a subject line and body. Do not fabricate any information beyond what was given.`,
      });
      return { email: output ?? null };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return { email: null, raw: error.text };
      }
      throw error;
    }
  });

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ notes: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const { output } = await generateText({
        model: getModel(),
        output: Output.object({
          schema: z.object({
            summary: z.string(),
            keyDecisions: z.array(z.string()),
            actionItems: z.array(z.string()),
            deadlines: z.array(z.string()),
          }),
        }),
        prompt: `You summarize meeting notes for busy professionals. ${RESPONSIBLE_AI_RULES}

Summarize the following meeting notes into:
- summary: 2-4 sentence overview
- keyDecisions: decisions explicitly made in the notes
- actionItems: tasks explicitly assigned or stated
- deadlines: only deadlines explicitly mentioned in the notes

If a section has nothing in the notes, return an empty array for it. Do not invent anything.

Meeting notes:
${data.notes}`,
      });
      return { result: output ?? null };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return { result: null, raw: error.text };
      }
      throw error;
    }
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        tasks: z.string().min(1),
        scope: z.enum(["Daily", "Weekly"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const { output } = await generateText({
        model: getModel(),
        output: Output.object({
          schema: z.object({
            plan: z.array(
              z.object({
                task: z.string(),
                priority: z.enum(["High", "Medium", "Low"]),
                estimatedDuration: z.string(),
                suggestedTime: z.string(),
              }),
            ),
          }),
        }),
        prompt: `You are a practical workplace task planner. ${RESPONSIBLE_AI_RULES}

Create a ${data.scope.toLowerCase()} plan for the tasks below. For each task give:
- task: the task name (rephrase only for clarity)
- priority: High, Medium or Low based on the wording
- estimatedDuration: a realistic estimate like "30 min" or "2 hours"
- suggestedTime: a suggested time slot (e.g. "9:00 AM" for daily plans, or "Monday morning" for weekly plans)

Do not invent deadlines that were not mentioned. Order tasks in a sensible working order.

Tasks:
${data.tasks}`,
      });
      return { plan: output?.plan ?? [] };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return { plan: [] };
      }
      throw error;
    }
  });
