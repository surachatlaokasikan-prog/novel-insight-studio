export type NovelChunk = {
  index: number;
  text: string;
  start: number;
  end: number;
};

export type ChunkProgress = {
  completed: number;
  total: number;
  percent: number;
};

/**
 * Split text on paragraph/sentence boundaries where possible.
 * The overlap gives the model a little context across chunk boundaries.
 * 1,000 pages is an approximate capacity target, not a strict page guarantee:
 * actual size depends on font, spacing, and document layout.
 */
export function splitNovel(
  source: string,
  maxChars = 12_000,
  overlapChars = 500
): NovelChunk[] {
  const text = source.replace(/\r\n/g, "\n").trim();
  if (!text) return [];
  if (maxChars <= overlapChars || overlapChars < 0) {
    throw new Error("ขนาดชุดข้อความต้องมากกว่าขนาดข้อความซ้อนทับ");
  }

  const chunks: NovelChunk[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);

    if (end < text.length) {
      const minEnd = start + Math.floor(maxChars * 0.65);
      const candidates = [
        text.lastIndexOf("\n\n", end),
        text.lastIndexOf("\n", end),
        text.lastIndexOf("。", end),
        text.lastIndexOf(".", end),
        text.lastIndexOf("!", end),
        text.lastIndexOf("?", end),
        text.lastIndexOf(" ", end),
      ];
      const boundary = candidates.find((p) => p >= minEnd);
      if (boundary && boundary > start) end = boundary + 1;
    }

    const piece = text.slice(start, end).trim();
    if (piece) chunks.push({ index: chunks.length, text: piece, start, end });

    if (end >= text.length) break;
    start = Math.max(start + 1, end - overlapChars);
  }

  return chunks;
}

export function getProgress(completed: number, total: number): ChunkProgress {
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export async function analyzeChunks<T>(
  chunks: NovelChunk[],
  mode: "proofread" | "summary" | "characters",
  onProgress?: (progress: ChunkProgress) => void,
  signal?: AbortSignal
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < chunks.length; i++) {
    if (signal?.aborted) throw new Error("ยกเลิกการวิเคราะห์แล้ว");
    const response = await fetch("/api/analyze-chunk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: chunks[i].text,
        chunkIndex: i,
        totalChunks: chunks.length,
        mode,
      }),
      signal,
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `วิเคราะห์ชุดที่ ${i + 1} ไม่สำเร็จ`);
    }
    results.push(payload.result as T);
    onProgress?.(getProgress(i + 1, chunks.length));
  }
  return results;
}
