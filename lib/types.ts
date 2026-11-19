export type Issue = {
  id: string;
  type: "spelling" | "spacing" | "grammar" | "style";
  original: string;
  suggestion: string;
  explanation: string;
  start: number;
  end: number;
  confidence: "high" | "medium" | "low";
};
export type Character = {
  name: string;
  aliases: string[];
  role: string;
  personality: string[];
  relationships: { character: string; relation: string }[];
  actions: string[];
  locations: string[];
  evidence: string[];
};
export type AnalysisResult = {
  issues: Issue[];
  summary: string;
  characters: Character[];
};
