# MovieBase - Pixel Perfect Streaming Clone

A full-featured movie streaming application built with React, Tailwind CSS v4, and Supabase.

## 🚀 Mobile APK Preparation
The project is optimized for Android deployment via Capacitor or Cordova. 
- **Relative Paths**: All imports and API calls use relative logic or dynamic environment variables.
- **Manifest**: `manifest.json` is included for PWA and Android Home Screen support.

## 🛠 Features
- **TMDB Integration**: Live movie data and search.
- **Hybrid Player**: Supports YouTube trailers and direct HLS (.m3u8) streams.
- **Admin Console**: Hidden route at `/admin-hidden` for manual HLS stream mapping.
- **Real-time Notifications**: Alerts for "My List" updates and system messages.
- **Auth**: Social Login (Google/GitHub) and Email/Password via Supabase.

## 🎨 Global Styles & Customization
- **Theme Variables**: Located in `/src/styles/theme.css`.
  - `--background`: Primary app background (#000000).
  - `--primary`: Accent color (#00FFCC).
  - `--secondary`: Active state color (#E61E2E).
- **Fonts**: Defined in `/src/styles/fonts.css`.

## 🔑 API Keys & Security
- **TMDB API**: Stored in `/src/app/utils/tmdb.ts`.
- **Supabase**: Keys are managed via `/utils/supabase/info.tsx` and environment secrets.
- **Service Role**: The `SUPABASE_SERVICE_ROLE_KEY` is kept strictly server-side in `/supabase/functions/server/index.tsx`.

## 💻 Local Development
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.
4. Ensure environment variables for Supabase are set in your local `.env`.

## 🔐 Admin Access
To add custom HLS links for specific TMDB movies:
1. Navigate to your deployed app.
2. Manually append `/admin-hidden` to the URL.
3. Input the **TMDB ID** and your **HLS Link**.
4. The Hybrid Player will now prioritize this HLS link over the YouTube trailer for that specific movie.

---
*Created for MovieBase Prototyping.*
