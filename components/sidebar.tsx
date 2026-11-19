"use client";
import { BookOpen, FileSearch, Languages, Users, FileBarChart2, LayoutDashboard, Moon, Sun, Settings } from "lucide-react";
import { useTheme } from "next-themes";
const links = [
  [LayoutDashboard, "ภาพรวม"], [FileSearch, "ตรวจต้นฉบับ"], [Languages, "แปลภาษา"],
  [Users, "วิเคราะห์ตัวละคร"], [FileBarChart2, "รายงาน"]
] as const;
export function Sidebar({ active, onSelect }: { active: string; onSelect: (v: string) => void }) {
  const { theme, setTheme } = useTheme();
  return <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#171824]">
    <div className="mb-10 flex items-center gap-3"><div className="rounded-xl bg-violet-600 p-2 text-white"><BookOpen size={21}/></div><div><div className="font-bold tracking-tight">Novel Insight</div><div className="text-xs text-slate-500">AI Editorial Studio</div></div></div>
    <div className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Workspace</div>
    <nav className="space-y-1">{links.map(([Icon, label]) => <button key={label} onClick={() => onSelect(label)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${active === label ? "bg-violet-50 font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"}`}><Icon size={18}/>{label}</button>)}</nav>
    <div className="mt-auto space-y-2"><button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5">{theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}เปลี่ยนธีม</button><div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5"><div className="mb-1 flex items-center gap-2 text-sm font-semibold"><Settings size={15}/> AI Assistant</div><p className="text-xs leading-5 text-slate-500">ช่วยตรวจต้นฉบับและจัดระเบียบข้อมูลนิยายของคุณ</p></div></div>
  </aside>;
}
