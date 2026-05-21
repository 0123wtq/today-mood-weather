# Today: Mood & Weather

오늘 날짜, 오늘의 기분(이모지 선택), 그리고 현재 위치의 날씨를 한 화면에서 보여주는 작은 Next.js 앱입니다.

## 스택
- Next.js 14 (App Router) + React 18 + TypeScript
- 날씨 데이터: [Open-Meteo](https://open-meteo.com) (API 키 불필요)
- 위치: 브라우저 Geolocation API

## 로컬 실행
```bash
npm install
npm run dev
```
브라우저에서 http://localhost:3000 으로 접속.

## Vercel 배포
1. Vercel 대시보드 → "Add New… → Project"
2. `0123wtq/today-mood-weather` 저장소 Import
3. Framework Preset이 자동으로 **Next.js** 로 잡힘 — 별도 설정 불필요
4. 환경변수 없음 (Open-Meteo 무료 공개 API 사용)
5. Deploy

## 사용
- 기분 버튼을 누르면 배경 그라데이션이 바뀝니다.
- 첫 진입 시 위치 권한을 허용하면 현재 날씨가 표시됩니다.
