"use client";
import { useMemo, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TextEditor } from "@/components/text-editor";
import { ErrorHighlighter } from "@/components/error-highlighter";
import { CharacterCards } from "@/components/character-cards";
import { ExportButtons } from "@/components/export-buttons";
import type { AnalysisResult, Issue } from "@/lib/types";
import mammoth from "mammoth";
import { AlertCircle, ArrowLeftRight, FileText, Loader2, Search, Sparkles, Users } from "lucide-react";
import Link from "next/link";

const empty: AnalysisResult = { issues: [], summary: "", characters: [] };
export default function WorkspacePage() {
  const [active, setActive] = useState("ตรวจต้นฉบับ");
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult>(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [translation, setTranslation] = useState("");
  const [source, setSource] = useState("Thai");
  const [target, setTarget] = useState("English");
  const [translateText, setTranslateText] = useState("");
  const count = useMemo(() => ({ chars: text.length, issues: result.issues.length, characters: result.characters.length }), [text, result]);
  async function loadFile(file: File) {
    setError("");
    try {
      if (file.name.toLowerCase().endsWith(".txt")) setText(await file.text());
      else if (file.name.toLowerCase().endsWith(".docx")) {
        const buffer = await file.arrayBuffer();
        const extracted = await mammoth.extractRawText({ arrayBuffer: buffer });
        setText(extracted.value);
      } else setError("รองรับเฉพาะไฟล์ .txt และ .docx");
    } catch { setError("ไม่สามารถอ่านไฟล์นี้ได้"); }
  }
  async function analyze() {
    if (!text.trim()) { setError("กรุณาวางข้อความหรืออัปโหลดไฟล์ก่อน"); return; }
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, tasks: ["proofread", "characters", "summary"] }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "วิเคราะห์ไม่สำเร็จ");
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด"); }
    finally { setBusy(false); }
  }
  function fix(issue: Issue) {
    if (text.slice(issue.start, issue.end) !== issue.original) { setError("ตำแหน่งข้อความเปลี่ยนไปแล้ว กรุณาวิเคราะห์ใหม่"); return; }
    setText(text.slice(0, issue.start) + issue.suggestion + text.slice(issue.end));
    setResult(old => ({ ...old, issues: old.issues.filter(i => i.id !== issue.id) }));
  }
  async function translate() {
    const input = translateText || text; if (!input.trim()) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: input, source, target }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error);
      setTranslation(data.translation);
    } catch (e) { setError(e instanceof Error ? e.message : "แปลไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  const tabs = ["ภาพรวม", "ตรวจต้นฉบับ", "แปลภาษา", "วิเคราะห์ตัวละคร", "รายงาน"];
  return <div className="flex min-h-screen bg-[#f7f7fb] text-slate-900 dark:bg-[#10111a] dark:text-slate-100">
    <Sidebar active={active} onSelect={setActive}/>
    <main className="min-w-0 flex-1">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/85 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-[#10111a]/85 md:px-8"><div><div className="text-xs text-slate-400">Novel Insight Studio / Workspace</div><h1 className="mt-1 text-lg font-bold">{active}</h1></div><Link href="/" className="text-xs text-slate-500 hover:text-violet-600">กลับหน้าแรก</Link></header>
      <div className="mx-auto max-w-7xl p-5 md:p-8">
        <div className="mb-6 flex gap-2 overflow-x-auto md:hidden">{tabs.map(t => <button key={t} onClick={() => setActive(t)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs ${active === t ? "bg-violet-600 text-white" : "bg-white dark:bg-white/10"}`}>{t}</button>)}</div>
        {error && <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={16}/>{error}</div>}
        {(active === "ตรวจต้นฉบับ" || active === "ภาพรวม") && <>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-bold">ตรวจสอบต้นฉบับนิยาย</h2><p className="mt-1 text-sm text-slate-500">อัปโหลดหรือวางข้อความ จากนั้นให้ AI ตรวจและวิเคราะห์</p></div><button onClick={analyze} disabled={busy || !text.trim()} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">{busy ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>}วิเคราะห์ด้วย AI</button></div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.8fr)]"><div className="space-y-5"><TextEditor value={text} onChange={v => { setText(v); }} onFile={loadFile}/><div className="grid grid-cols-3 gap-3">{[["ตัวอักษร", count.chars], ["จุดที่ควรตรวจ", count.issues], ["ตัวละคร", count.characters]].map(([l,v]) => <div key={l} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[.03]"><div className="text-xl font-bold">{Number(v).toLocaleString()}</div><div className="mt-1 text-xs text-slate-500">{l}</div></div>)}</div></div><section><div className="mb-3 flex items-center gap-2 font-semibold"><Search size={17}/> ผลการตรวจสอบ</div><ErrorHighlighter issues={result.issues} onFix={fix}/></section></div>
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[.03]"><h3 className="mb-2 font-semibold">สรุปเนื้อเรื่อง</h3><p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">{result.summary || "สรุปเนื้อเรื่องจะแสดงหลังจากวิเคราะห์ต้นฉบับ"}</p></section>
        </>}
        {active === "แปลภาษา" && <section className="space-y-5"><div><h2 className="text-2xl font-bold">แปลต้นฉบับ</h2><p className="mt-1 text-sm text-slate-500">เลือกภาษาและแปลทั้งเรื่องหรือเฉพาะข้อความที่ต้องการ</p></div><div className="flex flex-wrap items-center gap-3"><select value={source} onChange={e => setSource(e.target.value)} className="rounded-xl border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#171824]"><option>Thai</option><option>English</option><option>Japanese</option><option>Chinese</option><option>Korean</option></select><ArrowLeftRight/><select value={target} onChange={e => setTarget(e.target.value)} className="rounded-xl border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#171824]"><option>English</option><option>Thai</option><option>Japanese</option><option>Chinese</option><option>Korean</option></select><button onClick={translate} disabled={busy} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white">แปลด้วย AI</button></div><div className="grid gap-4 lg:grid-cols-2"><textarea value={translateText} onChange={e => setTranslateText(e.target.value)} placeholder="วางข้อความที่ต้องการแปล (เว้นว่างเพื่อใช้ต้นฉบับหลัก)" className="min-h-[350px] rounded-2xl border bg-white p-5 text-sm leading-7 outline-none dark:border-white/10 dark:bg-white/[.03]"/><div className="min-h-[350px] whitespace-pre-wrap rounded-2xl border bg-white p-5 text-sm leading-7 dark:border-white/10 dark:bg-white/[.03]">{translation || <span className="text-slate-400">คำแปลจะแสดงที่นี่</span>}</div></div></section>}
        {active === "วิเคราะห์ตัวละคร" && <section><div className="mb-5 flex items-end justify-between"><div><h2 className="text-2xl font-bold">Character Database</h2><p className="mt-1 text-sm text-slate-500">ตัวละครและความสัมพันธ์ที่ AI สกัดจากต้นฉบับ</p></div><button onClick={analyze} disabled={busy || !text.trim()} className="rounded-xl bg-violet-600 px-4 py-3 text-xs font-semibold text-white"><Users className="mr-2 inline" size={15}/>วิเคราะห์ตัวละคร</button></div><CharacterCards characters={result.characters}/></section>}
        {active === "รายงาน" && <section className="space-y-5"><div><h2 className="text-2xl font-bold">Editorial Report</h2><p className="mt-1 text-sm text-slate-500">ส่งออกผลการวิเคราะห์เป็นเอกสาร</p></div><div className="rounded-2xl border bg-white p-5 dark:border-white/10 dark:bg-white/[.03]"><div className="mb-4 flex items-center gap-2 font-semibold"><FileText size={18}/> รายงานต้นฉบับ</div><p className="mb-5 text-sm text-slate-500">ประกอบด้วยสรุปเรื่อง ตัวละคร ความสัมพันธ์ และรายการคำผิดที่ตรวจพบ</p><ExportButtons summary={result.summary} characters={result.characters} issues={result.issues}/></div></section>}
      </div>
    </main>
  </div>;
}
