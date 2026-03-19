# Firebase Setup Guide for LifeTap

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Enter project name: `lifetap` (or your preferred name)
4. Disable Google Analytics (not needed for this app)
5. Click "Create project"

## Step 2: Enable Realtime Database

1. In the Firebase console, go to "Build" > "Realtime Database"
2. Click "Create Database"
3. Choose a location close to your users
4. Select "Start in **test mode**" (for now, we'll update rules next)
5. Click "Enable"

## Step 3: Get Your Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Register app with nickname: `lifetap-web`
5. Copy the `firebaseConfig` object

## Step 4: Update Your .env File

Copy your config values to `src/lib/firebase/.env`:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 5: Update Database Rules

1. Go to "Realtime Database" > "Rules"
2. Replace the rules with the contents of `firebase.rules.json`
3. Click "Publish"

## Step 6: Test It

1. Run `npm run dev`
2. Create a game
3. Open another browser/tab with the same URL
4. Join with the same session code
5. Changes should sync between tabs

## Firebase Project Structure

The app uses this structure in Realtime Database:

```
lifetap/
└── sessions/
    └── {SESSION_CODE}/
        ├── code: "ABC123"
        ├── createdAt: 1234567890
        ├── updatedAt: 1234567890
        ├── status: "active"
        ├── creatorId: "player_xxx"
        ├── playerCount: 4
        └── players/
            ├── {PLAYER_ID}/
            │   ├── id: "player_xxx"
            │   ├── name: "Alice"
            │   ├── life: 40
            │   ├── color: "#ef4444"
            │   ├── commanderCount: 1
            │   ├── commanders: [...]
            │   ├── damageReceived: [...]
            │   ├── joinedAt: 1234567890
            │   ├── lastSeenAt: 1234567890
            │   └── isDead: false
            └── ...
```

## Troubleshooting

**"Permission denied" errors:**
- Make sure database rules are published
- Check your `.env` file has correct values

**Data not syncing:**
- Check browser console for errors
- Verify Firebase config matches your project

**Session not found:**
- When joining, make sure the session code exists
- The session creator must have the session open for others to join
