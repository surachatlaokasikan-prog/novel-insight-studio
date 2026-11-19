"use client";
import { useState } from "react";
import { ChevronDown, MapPin, Network, Sparkles } from "lucide-react";
import type { Character } from "@/lib/types";
export function CharacterCards({ characters }: { characters: Character[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!characters.length) return <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">ยังไม่มีข้อมูลตัวละคร ลองกดวิเคราะห์ต้นฉบับก่อน</p>;
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{characters.map((c, i) => <article key={`${c.name}-${i}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[.03]">
    <div className="mb-3 flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">{c.name.slice(0, 1)}</div><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600 dark:bg-white/10 dark:text-slate-300">{c.role || "ไม่ระบุบทบาท"}</span></div>
    <h3 className="font-bold">{c.name}</h3><p className="mt-1 text-xs text-slate-500">{c.aliases.join(" / ") || "ไม่มีฉายาที่ระบุ"}</p>
    <div className="mt-3 flex flex-wrap gap-1">{c.personality.slice(0, 3).map(p => <span key={p} className="rounded-md bg-violet-50 px-2 py-1 text-[10px] text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">{p}</span>)}</div>
    <button onClick={() => setExpanded(expanded === c.name ? null : c.name)} className="mt-4 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-violet-700 dark:border-white/10 dark:text-violet-300">รายละเอียดเพิ่มเติม <ChevronDown size={15} className={expanded === c.name ? "rotate-180" : ""}/></button>
    {expanded === c.name && <div className="mt-3 space-y-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
      <div><p className="mb-1 flex items-center gap-1 font-bold"><Sparkles size={13}/>การกระทำสำคัญ</p>{c.actions.map((a, j) => <p key={j}>• {a}</p>)}</div>
      <div><p className="mb-1 flex items-center gap-1 font-bold"><Network size={13}/>ความสัมพันธ์</p>{c.relationships.map((r, j) => <p key={j}>• {r.character}: {r.relation}</p>)}</div>
      <div><p className="mb-1 flex items-center gap-1 font-bold"><MapPin size={13}/>สถานที่</p>{c.locations.join(", ") || "ไม่พบข้อมูล"}</div>
      <div><p className="font-bold">หลักฐานจากต้นฉบับ</p>{c.evidence.map((e, j) => <p key={j} className="italic">“{e}”</p>)}</div>
    </div>}
  </article>)}</div>;
}
