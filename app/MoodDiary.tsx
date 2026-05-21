"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MOODS, MOOD_MAP, type Mood, type MoodKey } from "./lib/moods";
import {
  formatKoreanDate,
  loadEntries,
  saveEntry,
  todayKey,
  type Entry,
} from "./lib/storage";

type Phase = "intro" | "record";
type Status = "idle" | "saved" | "shared" | "copied" | "share-failed";

export default function MoodDiary() {
  const today = useMemo(() => todayKey(), []);
  const [phase, setPhase] = useState<Phase>("intro");
  const [selected, setSelected] = useState<MoodKey | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [existingEntry, setExistingEntry] = useState<Entry | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const all = loadEntries();
    const entry = all[today] ?? null;
    setExistingEntry(entry);
  }, [today]);

  const selectedMood = selected ? MOOD_MAP[selected] : null;
  const existingMood = existingEntry ? MOOD_MAP[existingEntry.mood] : null;

  const background = selectedMood
    ? selectedMood.gradient
    : existingMood && phase === "intro"
      ? existingMood.gradient
      : "linear-gradient(135deg, #F5F7FA 0%, #E4EBF5 100%)";

  function startRecord() {
    if (existingEntry) {
      setSelected(existingEntry.mood);
      setNote(existingEntry.note);
    } else {
      setSelected(null);
      setNote("");
    }
    setStatus("idle");
    setPhase("record");
  }

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
    saved: "저장됐어요.",
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
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <header style={{ color: "#1a1a1a" }}>
          <p style={{ fontSize: 12, letterSpacing: 2, opacity: 0.7 }}>
            MOOD WEATHER
          </p>
          <h1 style={{ fontSize: 24, marginTop: 4, fontWeight: 700 }}>
            {phase === "intro"
              ? "오늘 마음은 어떤 날씨인가요?"
              : "감정을 골라주세요"}
          </h1>
          <p style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
            {formatKoreanDate(today)}
          </p>
        </header>

        {phase === "intro" ? (
          <IntroPanel
            hydrated={hydrated}
            existingEntry={existingEntry}
            existingMood={existingMood}
            onStart={startRecord}
          />
        ) : (
          <RecordPanel
            selected={selected}
            selectedMood={selectedMood}
            note={note}
            onSelect={handleSelect}
            onNoteChange={setNote}
            onBack={() => setPhase("intro")}
          />
        )}

        {phase === "record" && selectedMood && (
          <ResultCard
            mood={selectedMood}
            note={note}
            dateLabel={formatKoreanDate(today)}
          />
        )}

        {phase === "record" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={handleSave}
              disabled={!selected}
              style={{
                padding: "16px 16px",
                borderRadius: 14,
                background: selected ? "#1a1a1a" : "rgba(255,255,255,0.6)",
                color: selected ? "#fff" : "#999",
                fontSize: 16,
                fontWeight: 700,
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
                padding: "16px 16px",
                borderRadius: 14,
                background: selected ? "#fff" : "rgba(255,255,255,0.6)",
                color: selected ? "#1a1a1a" : "#999",
                fontSize: 16,
                fontWeight: 700,
                boxShadow: selected ? "0 8px 22px rgba(0,0,0,0.12)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              공유하기
            </button>
          </div>
        )}

        <div
          aria-live="polite"
          style={{
            minHeight: 22,
            fontSize: 14,
            fontWeight: 600,
            color: "#1a1a1a",
            opacity: status === "idle" ? 0 : 0.9,
            textAlign: "center",
            transition: "opacity 0.2s ease",
          }}
        >
          {hydrated ? statusMessage[status] : ""}
        </div>

        {(phase === "intro" || status === "saved") && (
          <Link
            href="/calendar"
            style={{
              display: "block",
              textAlign: "center",
              padding: "16px 16px",
              borderRadius: 14,
              background:
                status === "saved"
                  ? "#1a1a1a"
                  : "rgba(255,255,255,0.85)",
              color: status === "saved" ? "#fff" : "#1a1a1a",
              fontSize: 16,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow:
                status === "saved"
                  ? "0 10px 28px rgba(0,0,0,0.22)"
                  : "0 4px 14px rgba(0,0,0,0.08)",
            }}
          >
            📅 캘린더 보기
          </Link>
        )}
      </div>
    </main>
  );
}

function IntroPanel({
  hydrated,
  existingEntry,
  existingMood,
  onStart,
}: {
  hydrated: boolean;
  existingEntry: Entry | null;
  existingMood: Mood | null;
  onStart: () => void;
}) {
  const hasEntry = hydrated && existingEntry && existingMood;

  return (
    <section
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderRadius: 24,
        padding: 24,
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {hasEntry ? (
        <>
          <div
            style={{
              borderRadius: 18,
              padding: 18,
              background: existingMood!.gradient,
              color: "#fff",
              boxShadow: "0 10px 28px rgba(0,0,0,0.16)",
            }}
          >
            <p style={{ fontSize: 11, opacity: 0.9, letterSpacing: 1.5 }}>
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
              <span style={{ fontSize: 40 }}>{existingMood!.emoji}</span>
              <div>
                <p style={{ fontSize: 20, fontWeight: 700 }}>
                  {existingMood!.label}
                </p>
                <p style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                  {existingMood!.description}
                </p>
              </div>
            </div>
            {existingEntry!.note && (
              <p
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  lineHeight: 1.5,
                  opacity: 0.95,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                "{existingEntry!.note}"
              </p>
            )}
          </div>
          <p style={{ fontSize: 13, color: "#666", textAlign: "center" }}>
            오늘은 이미 기록했어요. 마음이 바뀌었다면 다시 기록할 수 있어요.
          </p>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              ☀️ ☁️ 🌧 🌈
            </div>
          <p
            style={{
              fontSize: 15,
              color: "#444",
              lineHeight: 1.6,
            }}
          >
            오늘의 감정을 날씨처럼 골라
            <br />한 줄로 남겨보세요.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onStart}
        style={{
          padding: "18px 16px",
          borderRadius: 16,
          background: "#1a1a1a",
          color: "#fff",
          fontSize: 17,
          fontWeight: 700,
          boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
        }}
      >
        {hasEntry ? "다시 기록하기" : "오늘 감정 기록하기"}
      </button>
    </section>
  );
}

function RecordPanel({
  selected,
  selectedMood,
  note,
  onSelect,
  onNoteChange,
  onBack,
}: {
  selected: MoodKey | null;
  selectedMood: Mood | null;
  note: string;
  onSelect: (k: MoodKey) => void;
  onNoteChange: (v: string) => void;
  onBack: () => void;
}) {
  return (
    <section
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderRadius: 24,
        padding: 20,
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2 style={{ fontSize: 14, color: "#444", fontWeight: 700 }}>
          1. 감정 날씨 고르기
        </h2>
        <button
          type="button"
          onClick={onBack}
          style={{
            fontSize: 12,
            color: "#666",
            padding: "6px 10px",
            borderRadius: 8,
            background: "#F4F5F7",
          }}
        >
          처음으로
        </button>
      </div>

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
              onClick={() => onSelect(m.key)}
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
              <span style={{ fontSize: 12, fontWeight: 600 }}>{m.label}</span>
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

      <div style={{ marginTop: 20 }}>
        <label
          htmlFor="mood-note"
          style={{
            fontSize: 14,
            color: "#444",
            fontWeight: 700,
            display: "block",
            marginBottom: 8,
          }}
        >
          2. 한 줄 기록{" "}
          <span style={{ opacity: 0.5, fontWeight: 400 }}>(선택)</span>
        </label>
        <textarea
          id="mood-note"
          value={note}
          onChange={(e) => onNoteChange(e.target.value.slice(0, 140))}
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
  );
}

function ResultCard({
  mood,
  note,
  dateLabel,
}: {
  mood: Mood;
  note: string;
  dateLabel: string;
}) {
  return (
    <section
      aria-label="결과 카드"
      style={{
        borderRadius: 24,
        padding: 24,
        background: mood.gradient,
        color: "#fff",
        boxShadow: "0 16px 44px rgba(0,0,0,0.18)",
        minHeight: 160,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <p style={{ fontSize: 12, opacity: 0.9, letterSpacing: 1.5 }}>
          3. 결과 카드
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 6,
          }}
        >
          <span style={{ fontSize: 44 }}>{mood.emoji}</span>
          <div>
            <p style={{ fontSize: 22, fontWeight: 700 }}>{mood.label}</p>
            <p style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
              {mood.description}
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
        {dateLabel}
      </p>
    </section>
  );
}

