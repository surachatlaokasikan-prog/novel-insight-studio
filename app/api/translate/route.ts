import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAI, MODEL } from "@/lib/openai";
import { translationPrompt } from "@/lib/prompts";
export const runtime = "nodejs";
const schema = z.object({ text: z.string().min(1).max(80000), source: z.string(), target: z.string() });
export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
    const { text, source, target } = parsed.data;
    const ai = getOpenAI();
    const result = await ai.chat.completions.create({
      model: MODEL, temperature: 0.2,
      messages: [
        { role: "system", content: `${translationPrompt}\nภาษาต้นทาง: ${source}\nภาษาเป้าหมาย: ${target}\nคืนเฉพาะคำแปล` },
        { role: "user", content: text }
      ]
    });
    return NextResponse.json({ translation: result.choices[0]?.message?.content || "" });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Translation failed" }, { status: 500 });
  }
}
