import { Suspense } from "react";
import MoodDiary from "./MoodDiary";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MoodDiary />
    </Suspense>
  );
}
