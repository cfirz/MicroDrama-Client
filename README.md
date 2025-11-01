# Micro-Drama Mobile App

Expo-managed React Native mobile client for vertical micro-drama streaming app.

## Features

- Vertical, full-screen episode playback (Mux HLS streaming)
- Swipe up/down to navigate between episodes
- Show list and show detail with likes/dislikes
- Filter and sort episodes (all, watched, unwatched)
- Prefetch next episode for smoother transitions
- Client-side watch history tracking

## Prerequisites

- **Node.js** (LTS version recommended)
- **npm** or **yarn**
- **Expo CLI** (or use `npx expo`)
- **Running server** (see `../server/README.md` for setup instructions)
  - Server must be accessible from your device/emulator
  - Default: `http://localhost:4000` (iOS Simulator) or `http://10.0.2.2:4000` (Android Emulator)

## Setup Instructions

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API base URL (optional):**
   
   Create a `.env` file in the `mobile/` directory:
   ```env
   API_BASE_URL=http://localhost:4000
   ```
   
   For Android emulator, use:
   ```env
   API_BASE_URL=http://10.0.2.2:4000
   ```
   
   For physical device on same network, use your computer's LAN IP:
   ```env
   API_BASE_URL=http://192.168.1.xxx:4000
   ```
   
   **Note:** The app will automatically detect the API URL in most cases, but explicit configuration is recommended.

4. **Start the development server:**
   ```bash
   npm start
   ```
   
   Or use the Expo CLI directly:
   ```bash
   npx expo start
   ```

5. **Run on device/emulator:**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app on physical device
   - Press `w` to open in web browser (limited functionality)

## Configuration

The app resolves the API base URL in this order:

1. `app.config.ts` → `extra.apiBaseUrl` (if configured)
2. `process.env.API_BASE_URL` (from `.env` file)
3. Expo Go host inference (when running in Expo Go)
4. Platform-specific defaults:
   - Android emulator: `http://10.0.2.2:4000`
   - iOS simulator: `http://localhost:4000`

## Running the App

### Development Mode
```bash
npm start
```

### Android
```bash
npm run android
# or
npx expo run:android
```

### iOS
```bash
npm run ios
# or
npx expo run:ios
```

### Web (limited functionality)
```bash
npm run web
# or
npx expo start --web
```

## Project Structure

```
mobile/
├── src/
│   ├── api/              # API client (Axios, schemas)
│   ├── components/       # Reusable UI components
│   ├── navigation/       # React Navigation setup
│   ├── screens/          # Screen components
│   ├── stores/          # Zustand state management
│   ├── theme/           # Theme configuration
│   └── types/           # TypeScript type definitions
├── app.config.ts        # Expo configuration
└── package.json
```

## Tech Stack

- **Expo** - React Native framework
- **React Navigation** - Navigation (Stack + Bottom Tabs)
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **expo-video** - HLS video playback
- **Zod** - Schema validation
- **TypeScript** - Type safety

## Troubleshooting

### Connection Issues

**Problem:** App can't connect to server

**Solutions:**
1. Ensure server is running (check `http://localhost:4000/api/v1/health`)
2. For Android emulator, use `http://10.0.2.2:4000` instead of `localhost`
3. For physical device, ensure device and computer are on same network
4. Check firewall settings
5. Verify CORS is configured on server to allow your origin

### Video Playback Issues

**Problem:** Videos won't play

**Solutions:**
1. Verify Mux playback IDs are configured in database
2. Check network connectivity
3. Ensure server is returning valid Mux URLs
4. Check Expo Go compatibility (consider using development build)

### Build Issues

**Problem:** npm install fails

**Solutions:**
1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Clear npm cache: `npm cache clean --force`
3. Check Node.js version (use LTS)
4. Try using `yarn` instead of `npm`

## Testing

Run tests:
```bash
npm test
```

## Notes

- Orientation is locked to portrait mode
- Player attempts to preload the next episode when playback reaches ~80%
- Watch history is stored locally and synced with server on app launch
