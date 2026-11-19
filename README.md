# Novel Insight Studio

AI-assisted Thai novel editorial workspace built with Next.js App Router, TypeScript, Tailwind CSS and OpenAI.

## Setup
1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL`.
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open http://localhost:3000.

## Features in this starter
- Landing page and responsive workspace
- `.txt` and `.docx` import (DOCX text extraction with Mammoth)
- AI proofreading / spacing / grammar suggestions
- One-click replacement for validated exact text offsets
- Character extraction cards and expandable details
- Thai/English/Japanese/Chinese/Korean translation endpoint and UI
- Summary, PDF and DOCX export buttons
- Dark mode

## API
- `POST /api/analyze` body: `{ "text": "...", "tasks": ["proofread", "characters", "summary"] }`
- `POST /api/translate` body: `{ "text": "...", "source": "Thai", "target": "English" }`

## Important production notes
- The current analysis route accepts up to 80,000 characters. Long novels should be split by chapter or chunked with overlap, then merged and deduplicated.
- AI proofreading is advisory. Review suggestions before accepting; literary voice, dialect, names and intentional spacing can be misclassified.
- The UI currently runs analysis on button click, not on every keystroke. This avoids sending unfinished text and unexpected API costs. Add debounced autosave / background analysis only after usage limits and consent are designed.
- PDF export uses jsPDF's built-in font, which does not include Thai glyphs. For correct Thai PDF output, embed a Thai TTF font (for example Noto Sans Thai) with jsPDF, or implement server-side PDF generation with a Unicode-capable font. DOCX export supports Thai text.
- The current DOCX importer extracts plain text; it does not preserve page layout, comments, footnotes, tracked changes or paragraph styles.
- Add authentication, per-user storage, rate limiting, audit logs, file size limits, malware scanning and retention controls before public deployment.
- Keep `OPENAI_API_KEY` server-side only. Never prefix it with `NEXT_PUBLIC_`.
- Character and summary outputs are based only on the submitted excerpt. For full-book continuity, persist chapter analyses and build a cross-chapter entity resolution step.

## Folder structure
```text
app/
  api/
    analyze/route.ts
    translate/route.ts
  workspace/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  character-cards.tsx
  error-highlighter.tsx
  export-buttons.tsx
  sidebar.tsx
  text-editor.tsx
  theme-provider.tsx
lib/
  openai.ts
  prompts.ts
  types.ts
```
