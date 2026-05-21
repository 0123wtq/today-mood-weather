export type MoodKey =
  | "sunny"
  | "cloudy"
  | "rain"
  | "shower"
  | "storm"
  | "fog"
  | "rainbow";

export type Mood = {
  key: MoodKey;
  emoji: string;
  label: string;
  description: string;
  gradient: string;
  accent: string;
};

export const MOODS: Mood[] = [
  {
    key: "sunny",
    emoji: "☀️",
    label: "맑음",
    description: "기분 좋고 가벼운 날",
    gradient: "linear-gradient(135deg, #FFE99A 0%, #FFB86B 100%)",
    accent: "#F59E0B",
  },
  {
    key: "cloudy",
    emoji: "☁️",
    label: "구름",
    description: "무난하지만 조금 답답한 날",
    gradient: "linear-gradient(135deg, #E6ECF2 0%, #B0BEC5 100%)",
    accent: "#90A4AE",
  },
  {
    key: "rain",
    emoji: "🌧",
    label: "비",
    description: "축 처지고 우울한 날",
    gradient: "linear-gradient(135deg, #8FA8C0 0%, #4A6580 100%)",
    accent: "#546E7A",
  },
  {
    key: "shower",
    emoji: "🌦",
    label: "소나기",
    description: "갑자기 감정이 흔들린 날",
    gradient: "linear-gradient(135deg, #B3E5FC 0%, #4FC3F7 100%)",
    accent: "#039BE5",
  },
  {
    key: "storm",
    emoji: "🌪",
    label: "폭풍",
    description: "화나고 버거운 날",
    gradient: "linear-gradient(135deg, #6B7280 0%, #1F2937 100%)",
    accent: "#374151",
  },
  {
    key: "fog",
    emoji: "🌫",
    label: "안개",
    description: "복잡하고 잘 모르겠는 날",
    gradient: "linear-gradient(135deg, #E0E0E0 0%, #9E9E9E 100%)",
    accent: "#757575",
  },
  {
    key: "rainbow",
    emoji: "🌈",
    label: "무지개",
    description: "힘들었지만 괜찮아진 날",
    gradient:
      "linear-gradient(135deg, #FF9AA2 0%, #FFDAC1 25%, #E2F0CB 50%, #B5EAD7 75%, #C7CEEA 100%)",
    accent: "#7C3AED",
  },
];

export const MOOD_MAP: Record<MoodKey, Mood> = MOODS.reduce(
  (acc, m) => {
    acc[m.key] = m;
    return acc;
  },
  {} as Record<MoodKey, Mood>,
);
