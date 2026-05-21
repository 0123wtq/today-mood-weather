"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MOODS, MOOD_MAP, type MoodKey } from "../lib/moods";
import { loadEntries, todayKey, type EntriesMap } from "../lib/storage";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function monthKey(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

export default function CalendarView() {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [entries, setEntries] = useState<EntriesMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setEntries(loadEntries());
  }, []);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = todayKey(today);

  const cells: Array<{ day: number | null; key: string | null }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, key: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, key: monthKey(year, month, d) });
  }

  const monthEntries = Object.values(entries).filter((e) =>
    e.date.startsWith(`${year}-${pad(month + 1)}-`),
  );

  const topMood = useMemo(() => {
    if (monthEntries.length === 0) return null;
    const counts = new Map<MoodKey, number>();
    for (const e of monthEntries) {
      counts.set(e.mood, (counts.get(e.mood) ?? 0) + 1);
    }
    let best: MoodKey | null = null;
    let bestCount = 0;
    for (const [k, c] of counts) {
      if (c > bestCount) {
        best = k;
        bestCount = c;
      }
    }
    return best ? { mood: MOOD_MAP[best], count: bestCount } : null;
  }, [monthEntries]);

  function changeMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(135deg, #F5F7FA 0%, #E4EBF5 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding:
          "calc(env(safe-area-inset-top, 0px) + 24px) 16px calc(env(safe-area-inset-bottom, 0px) + 32px)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        <header style={{ marginBottom: 16 }}>
          <Link
            href="/"
            style={{
              fontSize: 13,
              color: "#666",
              textDecoration: "none",
            }}
          >
            ← 오늘 기록하기
          </Link>
          <h1
            style={{
              marginTop: 8,
              fontSize: 22,
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            감정 캘린더
          </h1>
        </header>

        <section
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 20,
            boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="이전 달"
              style={{
                padding: "6px 12px",
                borderRadius: 10,
                background: "#F4F5F7",
                fontSize: 16,
                color: "#1a1a1a",
              }}
            >
              ‹
            </button>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
              {year}년 {month + 1}월
            </p>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="다음 달"
              style={{
                padding: "6px 12px",
                borderRadius: 10,
                background: "#F4F5F7",
                fontSize: 16,
                color: "#1a1a1a",
              }}
            >
              ›
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
              marginBottom: 8,
            }}
          >
            {weekdayLabels.map((w, i) => (
              <div
                key={w}
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: 600,
                  color: i === 0 ? "#E53935" : i === 6 ? "#1E88E5" : "#888",
                  padding: "4px 0",
                }}
              >
                {w}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
            }}
          >
            {cells.map((cell, i) => {
              if (!cell.day || !cell.key) {
                return <div key={`empty-${i}`} style={{ aspectRatio: "1" }} />;
              }
              const entry = entries[cell.key];
              const mood = entry ? MOOD_MAP[entry.mood] : null;
              const isToday = cell.key === todayStr;
              return (
                <div
                  key={cell.key}
                  title={
                    entry
                      ? `${mood?.label}${entry.note ? ` · ${entry.note}` : ""}`
                      : undefined
                  }
                  style={{
                    aspectRatio: "1",
                    borderRadius: 12,
                    background: mood ? mood.gradient : "#F8F9FB",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: mood ? "#fff" : "#666",
                    border: isToday ? "2px solid #1a1a1a" : "2px solid transparent",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      opacity: 0.9,
                    }}
                  >
                    {cell.day}
                  </span>
                  {mood && (
                    <span style={{ fontSize: 18, lineHeight: 1 }}>
                      {mood.emoji}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section
          style={{
            marginTop: 18,
            background: "#fff",
            borderRadius: 20,
            padding: 18,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              fontSize: 13,
              color: "#666",
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            이번 달 감정 요약
          </h2>
          {!hydrated ? (
            <p style={{ fontSize: 14, color: "#999" }}>불러오는 중…</p>
          ) : monthEntries.length === 0 ? (
            <p style={{ fontSize: 14, color: "#999", lineHeight: 1.5 }}>
              아직 이번 달 기록이 없어요.
              <br />첫 감정을 기록해보세요.
            </p>
          ) : (
            <>
              {topMood && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    borderRadius: 14,
                    background: topMood.mood.gradient,
                    color: "#fff",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 32 }}>{topMood.mood.emoji}</span>
                  <div>
                    <p style={{ fontSize: 12, opacity: 0.9 }}>
                      가장 많았던 감정
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>
                      {topMood.mood.label} · {topMood.count}일
                    </p>
                  </div>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {MOODS.map((m) => {
                  const count = monthEntries.filter(
                    (e) => e.mood === m.key,
                  ).length;
                  if (count === 0) return null;
                  return (
                    <span
                      key={m.key}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: "#F4F5F7",
                        fontSize: 12,
                        color: "#444",
                      }}
                    >
                      {m.emoji} {m.label} {count}
                    </span>
                  );
                })}
              </div>
              <p
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: "#999",
                }}
              >
                총 {monthEntries.length}일 기록
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
