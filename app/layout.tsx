import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Novel Insight Studio",
  description: "AI-powered Thai novel proofreading and analysis workspace"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th" suppressHydrationWarning>
    <body><ThemeProvider attribute="class" defaultTheme="system" enableSystem>{children}</ThemeProvider></body>
  </html>;
}
