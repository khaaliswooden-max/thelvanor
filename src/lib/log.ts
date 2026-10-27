import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type LogEntry = {
  slug: string;
  title: string;
  date: string;
  phase: number;
  step?: string;
  summary: string;
  html: string;
};

const dir = path.join(process.cwd(), "content", "log");

export function getLogEntries(): LogEntry[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  const entries = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const html = marked.parse(content, { async: false }) as string;
    return {
      slug: file.replace(/\.md$/, ""),
      title: String(data.title ?? file),
      date: String(data.date ?? ""),
      phase: Number(data.phase ?? 0),
      step: data.step ? String(data.step) : undefined,
      summary: String(data.summary ?? ""),
      html,
    };
  });
  return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}
