"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MOODS, MOOD_MAP, type MoodKey } from "./lib/moods";
import {
  formatKoreanDate,
  loadEntries,
  saveEntry,
  todayKey,
  type Entry,
} from "./lib/storage";

type Status = "idle" | "saved" | "shared" | "copied" | "share-failed";

export default function MoodDiary() {
  const today = useMemo(() => todayKey(), []);
  const [selected, setSelected] = useState<MoodKey | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [existingEntry, setExistingEntry] = useState<Entry | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const all = loadEntries();
    const entry = all[today];
    if (entry) {
      setExistingEntry(entry);
      setSelected(entry.mood);
      setNote(entry.note);
    }
  }, [today]);

  const selectedMood = selected ? MOOD_MAP[selected] : null;
  const background = selectedMood
    ? selectedMood.gradient
    : "linear-gradient(135deg, #F5F7FA 0%, #E4EBF5 100%)";

  function handleSelect(key: MoodKey) {
    setSelected(key);
    setStatus("idle");
  }

  function handleSave() {
    if (!selected) return;
    const entry: Entry = {
      date: today,
      mood: selected,
      note: note.trim().slice(0, 140),
      createdAt: Date.now(),
    };
    saveEntry(entry);
    setExistingEntry(entry);
    setStatus("saved");
  }

  async function handleShare() {
    if (!selected) return;
    const mood = MOOD_MAP[selected];
    const text = `${mood.emoji} 오늘의 감정은 "${mood.label}"\n${
      note.trim() ? `"${note.trim()}"\n` : ""
    }— ${formatKoreanDate(today)}`;
    const shareData = { title: "오늘의 감정 날씨", text };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        setStatus("shared");
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard?.writeText
    ) {
      try {
        await navigator.clipboard.writeText(text);
        setStatus("copied");
        return;
      } catch {
        /* fall through */
      }
    }
    setStatus("share-failed");
  }

  const statusMessage: Record<Status, string> = {
    idle: "",
    saved: "오늘의 감정이 저장됐어요.",
    shared: "공유했어요.",
    copied: "공유 문구를 복사했어요.",
    "share-failed": "공유가 지원되지 않아요. 화면을 캡처해 보내보세요.",
  };

  return (
    <main
      style={{
        minHeight: "100dvh",
        background,
        transition: "background 0.6s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding:
          "calc(env(safe-area-inset-top, 0px) + 24px) 16px calc(env(safe-area-inset-bottom, 0px) + 32px)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        <header style={{ marginBottom: 20, color: "#1a1a1a" }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: 2,
              opacity: 0.7,
            }}
          >
            MOOD WEATHER
          </p>
          <h1 style={{ fontSize: 24, marginTop: 4, fontWeight: 700 }}>
            오늘 마음은 어떤 날씨인가요?
          </h1>
          <p style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
            {formatKoreanDate(today)}
            {existingEntry ? " · 오늘 이미 기록했어요" : ""}
          </p>
        </header>

        <section
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRadius: 24,
            padding: 20,
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          }}
        >
          <h2
            style={{
              fontSize: 14,
              color: "#444",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            감정 날씨 고르기
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
            }}
          >
            {MOODS.map((m) => {
              const active = selected === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleSelect(m.key)}
                  style={{
                    padding: "12px 6px",
                    borderRadius: 16,
                    background: active ? m.gradient : "#F4F5F7",
                    color: active ? "#fff" : "#1a1a1a",
                    boxShadow: active
                      ? "0 8px 20px rgba(0,0,0,0.18)"
                      : "0 1px 2px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    transform: active ? "translateY(-2px)" : "none",
                    transition: "all 0.18s ease",
                  }}
                >
                  <span style={{ fontSize: 26 }}>{m.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedMood && (
            <p
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "#555",
                textAlign: "center",
              }}
            >
              {selectedMood.emoji} {selectedMood.description}
            </p>
          )}

          <div style={{ marginTop: 18 }}>
            <label
              htmlFor="mood-note"
              style={{
                fontSize: 14,
                color: "#444",
                fontWeight: 600,
                display: "block",
                marginBottom: 8,
              }}
            >
              한 줄 기록 <span style={{ opacity: 0.5, fontWeight: 400 }}>(선택)</span>
            </label>
            <textarea
              id="mood-note"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 140))}
              placeholder="오늘 마음을 한 줄로 적어보세요"
              rows={3}
              style={{
                width: "100%",
                resize: "none",
                borderRadius: 14,
                border: "1px solid #E5E7EB",
                padding: "12px 14px",
                fontSize: 15,
                fontFamily: "inherit",
                outline: "none",
                background: "#fff",
                color: "#1a1a1a",
              }}
            />
            <div
              style={{
                textAlign: "right",
                fontSize: 11,
                color: "#999",
                marginTop: 4,
              }}
            >
              {note.length}/140
            </div>
          </div>
        </section>

        {selectedMood && (
          <section
            aria-label="결과 카드"
            style={{
              marginTop: 18,
              borderRadius: 24,
              padding: 24,
              background: selectedMood.gradient,
              color: "#fff",
              boxShadow: "0 16px 44px rgba(0,0,0,0.18)",
              minHeight: 160,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 12,
                  opacity: 0.9,
                  letterSpacing: 1.5,
                }}
              >
                TODAY'S MOOD
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 6,
                }}
              >
                <span style={{ fontSize: 44 }}>{selectedMood.emoji}</span>
                <div>
                  <p style={{ fontSize: 22, fontWeight: 700 }}>
                    {selectedMood.label}
                  </p>
                  <p style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                    {selectedMood.description}
                  </p>
                </div>
              </div>
            </div>
            <p
              style={{
                marginTop: 14,
                fontSize: 14,
                lineHeight: 1.5,
                opacity: 0.95,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {note.trim() ? `"${note.trim()}"` : "오늘의 한 줄을 적어보세요."}
            </p>
            <p
              style={{
                marginTop: 12,
                fontSize: 11,
                opacity: 0.85,
                textAlign: "right",
              }}
            >
              {formatKoreanDate(today)}
            </p>
          </section>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: 18,
          }}
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={!selected}
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              background: selected ? "#1a1a1a" : "rgba(255,255,255,0.6)",
              color: selected ? "#fff" : "#999",
              fontSize: 15,
              fontWeight: 600,
              boxShadow: selected ? "0 8px 22px rgba(0,0,0,0.18)" : "none",
              transition: "all 0.18s ease",
            }}
          >
            저장하기
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={!selected}
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              background: selected ? "#fff" : "rgba(255,255,255,0.6)",
              color: selected ? "#1a1a1a" : "#999",
              fontSize: 15,
              fontWeight: 600,
              boxShadow: selected ? "0 8px 22px rgba(0,0,0,0.12)" : "none",
              transition: "all 0.18s ease",
            }}
          >
            공유하기
          </button>
        </div>

        <div
          aria-live="polite"
          style={{
            minHeight: 20,
            marginTop: 10,
            fontSize: 13,
            color: "#1a1a1a",
            opacity: status === "idle" ? 0 : 0.85,
            textAlign: "center",
            transition: "opacity 0.2s ease",
          }}
        >
          {hydrated ? statusMessage[status] : ""}
        </div>

        <Link
          href="/calendar"
          style={{
            display: "block",
            textAlign: "center",
            marginTop: 18,
            padding: "12px 16px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.7)",
            color: "#1a1a1a",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          📅 캘린더 보기
        </Link>
      </div>
    </main>
  );
}
