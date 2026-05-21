import { Suspense } from "react";
import CalendarView from "./CalendarView";

export const metadata = {
  title: "감정 캘린더 · Mood Weather",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CalendarView />
    </Suspense>
  );
}
