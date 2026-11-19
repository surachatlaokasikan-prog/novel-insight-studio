 "use client";

import { useMemo, useState } from "react";
import { analyzeChunks, splitNovel, type ChunkProgress } from "@/lib/long-novel";

type Mode = "proofread" | "summary" | "characters";

export default function LongNovelAnalyzer() {
  const [source, setSource] = useState("");
  const [mode, setMode] = useState<Mode>("proofread");
  const [progress, setProgress] = useState<ChunkProgress | null>(null);
  const [results, setResults] = useState<unknown[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const chunks = useMemo(() => splitNovel(source), [source]);
  const estimatedPages = Math.max(1, Math.ceil(source.length / 1_800));

  async function run() {
    setBusy(true);
    setError("");
    setResults([]);
    setProgress({ completed: 0, total: chunks.length, percent: 0 });
    try {
      const data = await analyzeChunks<unknown>(
        chunks,
        mode,
        setProgress
      );
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setBusy(false);
    }
  }

  async function loadFile(file?: File) {
    if (!file) return;
    setError("");
    try {
      if (file.name.toLowerCase().endsWith(".txt")) {
        setSource(await file.text());
        return;
      }
      if (file.name.toLowerCase().endsWith(".docx")) {
        const mammoth = await import("mammoth/mammoth.browser");
        const buffer = await file.arrayBuffer();
        const extracted = await mammoth.extractRawText({ arrayBuffer: buffer });
        setSource(extracted.value);
        return;
      }
      setError("รองรับไฟล์ .txt และ .docx ในตัวอย่างนี้");
    } catch {
      setError("อ่านไฟล์ไม่สำเร็จ กรุณาลองบันทึกเป็น DOCX หรือ TXT แล้วอัปโหลดใหม่");
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-5 rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
      <div>
        <h2 className="text-xl font-semibold">วิเคราะห์นิยายเล่มใหญ่</h2>
        <p className="mt-1 text-sm text-slate-500">
          แบ่งเนื้อหาเป็นชุดอัตโนมัติและส่งให้ AI วิเคราะห์ทีละชุด
        </p>
      </div>

      <label className="block text-sm font-medium">
        อัปโหลดไฟล์ TXT หรือ DOCX
        <input
          type="file"
          accept=".txt,.docx"
          onChange={(e) => loadFile(e.target.files?.[0])}
          className="mt-2 block w-full rounded-lg border border-slate-300 p-2 text-sm"
          disabled={busy}
        />
      </label>

      <label className="block text-sm font-medium">
        หรือวางเนื้อหานิยาย
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          rows={10}
          placeholder="วางต้นฉบับนิยายที่นี่..."
          className="mt-2 w-full rounded-lg border border-slate-300 bg-transparent p-3 text-sm"
          disabled={busy}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="novel-mode">ประเภทการวิเคราะห์</label>
        <select
          id="novel-mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="rounded-lg border border-slate-300 bg-transparent px-3 py-2"
          disabled={busy}
        >
          <option value="proofread">ตรวจคำผิด / เว้นวรรค</option>
          <option value="summary">สรุปเนื้อหา</option>
          <option value="characters">วิเคราะห์ตัวละคร</option>
        </select>
        <span className="text-slate-500">
          ประมาณ {estimatedPages.toLocaleString()} หน้า · {chunks.length.toLocaleString()} ชุด
        </span>
      </div>

      <button
        type="button"
        onClick={run}
        disabled={busy || chunks.length === 0}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "กำลังวิเคราะห์..." : "เริ่มวิเคราะห์ทั้งเล่ม"}
      </button>

      {progress && (
        <div aria-live="polite" className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>ความคืบหน้า</span>
            <span>{progress.completed}/{progress.total} ชุด ({progress.percent}%)</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">ผลลัพธ์จาก {results.length} ชุด</h3>
          <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-100">
            {JSON.stringify(results, null, 2)}
          </pre>
          <button
            type="button"
            onClick={() => {
              const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "novel-analysis-results.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
          >
            ดาวน์โหลดผลวิเคราะห์ JSON
          </button>
        </div>
      )}
    </section>
  );
}
