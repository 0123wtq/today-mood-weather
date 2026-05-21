"use client";

import { useEffect, useMemo, useState } from "react";

type Mood = {
  key: string;
  emoji: string;
  label: string;
  gradient: string;
};

const MOODS: Mood[] = [
  { key: "great", emoji: "😄", label: "최고", gradient: "linear-gradient(135deg, #FFD86F 0%, #FC6262 100%)" },
  { key: "good", emoji: "🙂", label: "좋음", gradient: "linear-gradient(135deg, #A1FFCE 0%, #FAFFD1 100%)" },
  { key: "okay", emoji: "😐", label: "그저그럼", gradient: "linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)" },
  { key: "down", emoji: "😔", label: "울적", gradient: "linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)" },
  { key: "tired", emoji: "😴", label: "피곤", gradient: "linear-gradient(135deg, #4B6CB7 0%, #182848 100%)" },
];

type WeatherState = {
  loading: boolean;
  error: string | null;
  temperature?: number;
  weatherCode?: number;
  windSpeed?: number;
  locationLabel?: string;
};

const WEATHER_CODE_MAP: Record<number, { label: string; emoji: string }> = {
  0: { label: "맑음", emoji: "☀️" },
  1: { label: "대체로 맑음", emoji: "🌤️" },
  2: { label: "구름 조금", emoji: "⛅" },
  3: { label: "흐림", emoji: "☁️" },
  45: { label: "안개", emoji: "🌫️" },
  48: { label: "짙은 안개", emoji: "🌫️" },
  51: { label: "이슬비", emoji: "🌦️" },
  53: { label: "이슬비", emoji: "🌦️" },
  55: { label: "이슬비", emoji: "🌦️" },
  61: { label: "약한 비", emoji: "🌧️" },
  63: { label: "비", emoji: "🌧️" },
  65: { label: "강한 비", emoji: "🌧️" },
  71: { label: "약한 눈", emoji: "🌨️" },
  73: { label: "눈", emoji: "🌨️" },
  75: { label: "많은 눈", emoji: "❄️" },
  80: { label: "소나기", emoji: "🌦️" },
  81: { label: "소나기", emoji: "🌧️" },
  82: { label: "강한 소나기", emoji: "⛈️" },
  95: { label: "뇌우", emoji: "⛈️" },
  96: { label: "뇌우(우박)", emoji: "⛈️" },
  99: { label: "뇌우(우박)", emoji: "⛈️" },
};

function describeWeather(code: number | undefined) {
  if (code === undefined) return { label: "—", emoji: "❓" };
  return WEATHER_CODE_MAP[code] ?? { label: "알 수 없음", emoji: "❓" };
}

function formatToday(now: Date) {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}.${m}.${d} (${weekdays[now.getDay()]})`;
}

export default function TodayMoodWeather() {
  const [selectedMood, setSelectedMood] = useState<Mood>(MOODS[1]);
  const [weather, setWeather] = useState<WeatherState>({ loading: true, error: null });
  const today = useMemo(() => formatToday(new Date()), []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setWeather({ loading: false, error: "이 브라우저는 위치 서비스를 지원하지 않아요." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("날씨 정보를 불러오지 못했어요.");
          const data = await res.json();
          const cw = data.current_weather;
          setWeather({
            loading: false,
            error: null,
            temperature: cw?.temperature,
            weatherCode: cw?.weathercode,
            windSpeed: cw?.windspeed,
            locationLabel: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
          });
        } catch (e) {
          setWeather({
            loading: false,
            error: e instanceof Error ? e.message : "알 수 없는 오류",
          });
        }
      },
      () => {
        setWeather({
          loading: false,
          error: "위치 권한을 허용하면 현재 날씨를 보여드릴 수 있어요.",
        });
      },
      { timeout: 10000 }
    );
  }, []);

  const weatherInfo = describeWeather(weather.weatherCode);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: selectedMood.gradient,
        transition: "background 0.6s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(8px)",
          borderRadius: 24,
          padding: "32px 28px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <header style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: "#666", letterSpacing: 1 }}>TODAY</p>
          <h1 style={{ fontSize: 28, marginTop: 4 }}>{today}</h1>
        </header>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, color: "#444", marginBottom: 12 }}>오늘의 기분</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {MOODS.map((m) => {
              const active = m.key === selectedMood.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setSelectedMood(m)}
                  aria-pressed={active}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 16,
                    background: active ? "#1a1a1a" : "#fff",
                    color: active ? "#fff" : "#1a1a1a",
                    boxShadow: active
                      ? "0 6px 18px rgba(0,0,0,0.25)"
                      : "0 2px 6px rgba(0,0,0,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    minWidth: 72,
                    transition: "transform 0.15s ease",
                    transform: active ? "translateY(-2px)" : "none",
                  }}
                >
                  <span style={{ fontSize: 28 }}>{m.emoji}</span>
                  <span style={{ fontSize: 12 }}>{m.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 16, color: "#444", marginBottom: 12 }}>현재 날씨</h2>
          {weather.loading ? (
            <p style={{ color: "#666" }}>날씨 정보를 가져오는 중…</p>
          ) : weather.error ? (
            <p style={{ color: "#a33" }}>{weather.error}</p>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "#fff",
                borderRadius: 16,
                padding: "16px 18px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: 48 }}>{weatherInfo.emoji}</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 600 }}>
                  {weather.temperature !== undefined ? `${weather.temperature.toFixed(1)}°C` : "—"}
                </div>
                <div style={{ color: "#666", fontSize: 14 }}>
                  {weatherInfo.label}
                  {weather.windSpeed !== undefined ? ` · 바람 ${weather.windSpeed.toFixed(1)} km/h` : ""}
                </div>
                {weather.locationLabel && (
                  <div style={{ color: "#999", fontSize: 12, marginTop: 4 }}>
                    위치: {weather.locationLabel}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <footer style={{ marginTop: 24, textAlign: "center", color: "#888", fontSize: 12 }}>
          날씨 데이터: <a href="https://open-meteo.com" style={{ color: "#888" }}>Open-Meteo</a>
        </footer>
      </div>
    </main>
  );
}
