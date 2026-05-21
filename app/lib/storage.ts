import type { MoodKey } from "./moods";

export const STORAGE_KEY = "mood-weather:entries";

export type Entry = {
  date: string;
  mood: MoodKey;
  note: string;
  createdAt: number;
};

export type EntriesMap = Record<string, Entry>;

export function loadEntries(): EntriesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as EntriesMap;
    }
    return {};
  } catch {
    return {};
  }
}

export function saveEntry(entry: Entry): EntriesMap {
  const all = loadEntries();
  all[entry.date] = entry;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all;
}

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatKoreanDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${y}년 ${m}월 ${d}일 (${weekdays[date.getDay()]})`;
}

export function formatKoreanDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export function isValidDateKey(s: string | null | undefined): s is string {
  if (!s || !DATE_RE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}
