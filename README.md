# LifeTap - MTG Commander Life Counter

A multiplayer life counter for Magic: The Gathering Commander games. Real-time sync across devices via Firebase.

## Features

- Real-time multiplayer sync
- Life total tracking with +/- controls
- Commander damage tracking
- Player color coding
- Per-card edit locking
- Death detection (life ≤ 0 or 21 commander damage)

## Development

```bash
npm install
npm run dev
```

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Realtime Database
3. Copy your config to `.env`:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Set database rules for development:
```json
{
  "rules": {
    "sessions": {
      "$session": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

## Deployment

This app deploys automatically to GitHub Pages on push to main.

### First-time Setup:

1. Create a new GitHub repository
2. Push this code to the repository
3. Go to repository Settings > Pages
4. Under "Source", select "GitHub Actions"
5. Add your Firebase secrets to repository Settings > Secrets > Actions:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
6. Push to main - deployment will start automatically

The app will be available at: `https://yourusername.github.io/lifetap/`
