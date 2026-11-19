"use client";
import { ChangeEvent } from "react";
import { FileUp, Type } from "lucide-react";
export function TextEditor({ value, onChange, onFile }: { value: string; onChange: (v: string) => void; onFile: (f: File) => void }) {
  const upload = (e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; };
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#171824]">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-white/10"><div className="flex items-center gap-2 text-sm font-semibold"><Type size={16}/> ต้นฉบับนิยาย</div><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"><FileUp size={14}/>อัปโหลด .txt / .docx<input type="file" accept=".txt,.docx,text/plain" className="hidden" onChange={upload}/></label></div>
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder="วางต้นฉบับนิยายที่นี่ หรืออัปโหลดไฟล์ .txt / .docx..." className="min-h-[340px] w-full resize-y bg-transparent p-5 text-sm leading-8 outline-none placeholder:text-slate-400"/>
    <div className="flex justify-between border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400 dark:border-white/10"><span>รองรับข้อความภาษาไทย</span><span>{value.length.toLocaleString()} ตัวอักษร · {value.trim() ? value.trim().split(/\s+/).length : 0} คำโดยประมาณ</span></div>
  </div>;
}
