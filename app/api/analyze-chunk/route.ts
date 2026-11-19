import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type RequestBody = {
  text: string;
  chunkIndex: number;
  totalChunks: number;
  mode?: "proofread" | "summary" | "characters";
};

const MAX_CHUNK_CHARS = 12_000;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "ยังไม่ได้ตั้งค่า OPENAI_API_KEY" }, { status: 500 });
    }

    const body = (await req.json()) as RequestBody;
    const { text, chunkIndex, totalChunks, mode = "proofread" } = body;

    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "ไม่พบข้อความสำหรับวิเคราะห์" }, { status: 400 });
    }
    if (text.length > MAX_CHUNK_CHARS) {
      return NextResponse.json(
        { error: `ข้อความต่อชุดยาวเกิน ${MAX_CHUNK_CHARS.toLocaleString()} ตัวอักษร` },
        { status: 413 }
      );
    }
    if (!Number.isInteger(chunkIndex) || !Number.isInteger(totalChunks) ||
        chunkIndex < 0 || totalChunks < 1 || chunkIndex >= totalChunks) {
      return NextResponse.json({ error: "หมายเลขชุดข้อความไม่ถูกต้อง" }, { status: 400 });
    }

    const instructions = {
      proofread: `ตรวจต้นฉบับนิยายภาษาไทย เฉพาะคำผิด การสะกด เว้นวรรค และประโยคที่ผิดไวยากรณ์อย่างชัดเจน
อย่าเขียนใหม่ตามรสนิยม และอย่าเปลี่ยนสำนวนผู้เขียน หากไม่แน่ใจให้ละไว้
ตอบเป็น JSON ตาม schema: {"issues":[{"original":"ข้อความเดิมแบบตรงตัว","suggestion":"ข้อความที่แนะนำ","reason":"เหตุผลสั้นๆ","category":"สะกดคำ|เว้นวรรค|ไวยากรณ์|คำซ้ำ|อื่นๆ"}],"summary":"สรุปสั้นๆ"}
original ต้องเป็นข้อความที่ปรากฏตรงตัวในชุดข้อความนี้ ห้ามสร้างตำแหน่งหรือข้อความขึ้นเอง`,
      summary: `สรุปเหตุการณ์สำคัญของช่วงนิยายนี้เป็นภาษาไทย รักษาชื่อตัวละครและลำดับเหตุการณ์ ไม่แต่งเติมสิ่งที่ไม่มีในต้นฉบับ ตอบ JSON: {"summary":"...","events":["..."],"open_questions":["..."]}`,
      characters: `ดึงรายชื่อตัวละครที่ปรากฏในช่วงนี้ ตอบ JSON: {"characters":[{"name":"...","aliases":[],"traits":["..."],"actions":["..."],"relationships":["..."]}]} อย่าเดาข้อมูลที่ไม่มีในต้นฉบับ`
    }[mode];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: `ส่วนที่ ${chunkIndex + 1} จาก ${totalChunks}\n\n${text}` }
      ]
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    let result: unknown;
    try { result = JSON.parse(raw); }
    catch { return NextResponse.json({ error: "AI ส่งผลลัพธ์ที่อ่านไม่ได้ กรุณาลองชุดนี้อีกครั้ง" }, { status: 502 }); }

    return NextResponse.json({ chunkIndex, totalChunks, mode, result });
  } catch (error) {
    console.error("analyze-chunk error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดระหว่างวิเคราะห์" },
      { status: 500 }
    );
  }
}
