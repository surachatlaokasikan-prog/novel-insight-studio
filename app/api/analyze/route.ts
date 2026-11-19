import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAI, MODEL } from "@/lib/openai";
import { characterPrompt, proofreadingPrompt, summaryPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
const bodySchema = z.object({
  text: z.string().min(1).max(80000),
  tasks: z.array(z.enum(["proofread", "characters", "summary"])).min(1)
});

const outputSchema = z.object({
  issues: z.array(z.object({
    type: z.enum(["spelling", "spacing", "grammar", "style"]),
    original: z.string(), suggestion: z.string(), explanation: z.string(),
    start: z.number().int().nonnegative(), end: z.number().int().nonnegative(),
    confidence: z.enum(["high", "medium", "low"])
  })).default([]),
  summary: z.string().default(""),
  characters: z.array(z.object({
    name: z.string(), aliases: z.array(z.string()).default([]), role: z.string(),
    personality: z.array(z.string()).default([]),
    relationships: z.array(z.object({ character: z.string(), relation: z.string() })).default([]),
    actions: z.array(z.string()).default([]), locations: z.array(z.string()).default([]),
    evidence: z.array(z.string()).default([])
  })).default([])
});

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้องหรือข้อความยาวเกินกำหนด" }, { status: 400 });
    const { text, tasks } = parsed.data;
    const instructions = [
      tasks.includes("proofread") ? proofreadingPrompt : "",
      tasks.includes("characters") ? characterPrompt : "",
      tasks.includes("summary") ? summaryPrompt : ""
    ].filter(Boolean).join("\n\n");
    const client = getOpenAI();
    const response = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `${instructions}\n\nตอบเป็น JSON object ที่มี keys: issues, summary, characters เท่านั้น` },
        { role: "user", content: `วิเคราะห์ข้อความต่อไปนี้:\n\n${text}` }
      ]
    });
    const raw = response.choices[0]?.message?.content || "{}";
    const data = outputSchema.parse(JSON.parse(raw));
    // Validate offsets against the submitted source before allowing one-click replacement.
    data.issues = data.issues.filter(i =>
      i.start <= i.end && i.end <= text.length &&
      text.slice(i.start, i.end) === i.original
    ).map((i, index) => ({ ...i, id: `issue-${index}` }));
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการวิเคราะห์";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
