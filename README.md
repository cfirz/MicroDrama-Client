# Micro-Drama Mobile (Expo + React Native)

Expo-managed mobile client for vertical micro-dramas with swipe navigation and Mux HLS playback.

## Features

- Vertical, full-screen episode playback (Mux HLS via `https://stream.mux.com/{PlaybackID}.m3u8`).
- Swipe up/down to navigate between episodes.
- Show list and show detail with likes/dislikes.
- Filter and sort episodes (mirrors server query params).
- Prefetch next episode around 80% playback for smoother transitions.
- State: Zustand (UI), React Query (server data), Zod for client-side schema validation.

## Prerequisites

- Node.js LTS
- Expo CLI (or use `npx expo`)
- A running server (default `http://localhost:4000`)

## Getting Started

```bash
# From mobile/
npm install
npm run start
# Press 'a' for Android, 'i' for iOS, or open in Expo Go
```

## Configuration

The app resolves the API base URL in this order (see `src/api/http.ts` and `app.config.ts`):

1) `app.config.ts` → `extra.apiBaseUrl`
2) `process.env.API_BASE_URL`
3) Expo Go host inference (LAN IP)
4) Defaults: `http://10.0.2.2:4000` (Android emulator) or `http://localhost:4000`

Environment file example (`mobile/.env`):

```
API_BASE_URL=http://localhost:4000
```

A template is provided at `mobile/.env.example`.

## Navigation

Navigation structure (see `src/navigation/AppNavigator.tsx`):

**Stack Navigator:**
- `MainTabs` - Bottom tab navigator (initial route)
- `ShowList`
- `ShowDetail` (`{ showId }`)
- `EpisodePlayer` (`{ showId, episodeId }`)

**Bottom Tab Navigator (MainTabs):**
- `Home` - Home screen
- `Surprise` - Surprise content screen
- `MyList` - User's list screen
- `Rewards` - Rewards screen (placeholder)
- `Profile` - Profile screen (placeholder)

## API Usage

Client calls (see `src/api/*.ts`) expect the server mounted under `/api/v1`:

- GET `/api/v1/shows`
- GET `/api/v1/shows/:id`
- GET `/api/v1/shows/:id/episodes?filterBy=all|watched|unwatched&sortBy=title|order|created_at&orderBy=asc|desc`
- POST `/api/v1/shows/:id/like` with body `{ ratingValue: 0 | 1 }`

## Tech Stack

- Expo, React Native, TypeScript
- React Navigation (Stack + Bottom Tabs)
- @tanstack/react-query
- Zustand
- expo-video (HLS playback)
- Zod (schema validation)

## Scripts

```json
{
  "start": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios",
  "web": "expo start --web"
}
```

## Notes

- Orientation is portrait (see `app.config.ts`).
- Player attempts to preload the next episode when playback passes ~80%.
- For local development with emulators/simulators, ensure the API base URL resolves from device to host.
