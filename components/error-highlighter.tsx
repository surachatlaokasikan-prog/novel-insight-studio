"use client";
import type { Issue } from "@/lib/types";
import { Check, WandSparkles } from "lucide-react";
export function ErrorHighlighter({ issues, onFix }: { issues: Issue[]; onFix: (issue: Issue) => void }) {
  if (!issues.length) return <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-white/15">ยังไม่พบรายการ หรือยังไม่ได้วิเคราะห์ข้อความ</div>;
  return <div className="space-y-3">{issues.map(issue => <div key={issue.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[.03]">
    <div className="mb-2 flex items-center justify-between gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${issue.type === "spelling" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{issue.type === "spelling" ? "คำสะกด" : issue.type === "spacing" ? "เว้นวรรค" : issue.type === "grammar" ? "ไวยากรณ์" : "สำนวน"}</span><span className="text-[10px] text-slate-400">ความมั่นใจ: {issue.confidence}</span></div>
    <p className="text-sm text-slate-500">พบ: <span className="font-semibold text-rose-600 line-through">{issue.original || "ช่องว่าง"}</span></p>
    <p className="mt-1 text-sm">แนะนำ: <span className="font-semibold text-emerald-600">{issue.suggestion || "ลบช่องว่าง"}</span></p>
    <p className="mt-2 text-xs leading-5 text-slate-500">{issue.explanation}</p>
    <button onClick={() => onFix(issue)} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"><WandSparkles size={14}/>ใช้คำแนะนำ <Check size={13}/></button>
  </div>)}</div>;
}
