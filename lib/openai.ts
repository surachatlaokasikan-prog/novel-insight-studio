import OpenAI from "openai";
export function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("ยังไม่ได้ตั้งค่า OPENAI_API_KEY ในไฟล์ .env.local");
  return new OpenAI({ apiKey: key });
}
export const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
