"use client";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { jsPDF } from "jspdf";
import type { Character, Issue } from "@/lib/types";
import { Download } from "lucide-react";
export function ExportButtons({ summary, characters, issues }: { summary: string; characters: Character[]; issues: Issue[] }) {
  const report = `สรุปเรื่อง\n${summary}\n\nตัวละคร\n${characters.map(c => `${c.name} (${c.role})\nบุคลิก: ${c.personality.join(", ")}\nการกระทำ: ${c.actions.join("; ")}\nความสัมพันธ์: ${c.relationships.map(r => r.character + " - " + r.relation).join("; ")}`).join("\n\n")}\n\nรายการคำผิดและเว้นวรรค\n${issues.map(i => `${i.original} → ${i.suggestion} (${i.explanation})`).join("\n")}`;
  async function docx() {
    const doc = new Document({ sections: [{ children: [
      new Paragraph({ text: "Novel Insight Studio – Editorial Report", heading: HeadingLevel.TITLE }),
      new Paragraph({ text: "สรุปเรื่อง", heading: HeadingLevel.HEADING_1 }), new Paragraph(summary || "ยังไม่มีข้อมูล"),
      new Paragraph({ text: "วิเคราะห์ตัวละคร", heading: HeadingLevel.HEADING_1 }),
      ...characters.flatMap(c => [new Paragraph({ text: `${c.name} — ${c.role}`, heading: HeadingLevel.HEADING_2 }), new Paragraph(`บุคลิก: ${c.personality.join(", ")}`), new Paragraph(`การกระทำ: ${c.actions.join("; ")}`), new Paragraph(`ความสัมพันธ์: ${c.relationships.map(r => `${r.character}: ${r.relation}`).join("; ")}`), new Paragraph(`สถานที่: ${c.locations.join(", ")}`)]),
      new Paragraph({ text: "คำผิดและการเว้นวรรค", heading: HeadingLevel.HEADING_1 }),
      ...issues.map(i => new Paragraph(`${i.original} → ${i.suggestion} | ${i.explanation}`))
    ]}] });
    const blob = await Packer.toBlob(doc); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "novel-editorial-report.docx"; a.click(); URL.revokeObjectURL(url);
  }
  function pdf() {
    const pdf = new jsPDF(); pdf.setFont("helvetica"); pdf.setFontSize(16); pdf.text("Novel Insight Studio - Editorial Report", 14, 18);
    pdf.setFontSize(10); const lines = pdf.splitTextToSize(report, 180); let y = 30;
    lines.forEach((line: string) => { if (y > 280) { pdf.addPage(); y = 18; } pdf.text(line, 14, y); y += 6; });
    pdf.save("novel-editorial-report.pdf");
  }
  return <div className="flex flex-wrap gap-2"><button onClick={pdf} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"><Download size={15}/>Export PDF</button><button onClick={docx} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-700"><Download size={15}/>Export DOCX</button></div>;
}
