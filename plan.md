# LifeTap Project Plan

## 1. Project Summary

Build a lightweight web app for **Magic: The Gathering Commander** games where players join a shared session using a session code and use the app as a synchronized life counter.

Each player should be able to:

- Open the site from any device
- Join or create a session
- See all players in the current game
- Change life totals for players
- Change commander damage for players
- Rename players
- Customize player colors
- Reset life totals and commander damage to the Commander default

Primary constraint:

- The frontend can be hosted on **GitHub Pages**
- Shared multiplayer state requires a **separate backend or realtime database**

GitHub Pages can host the UI, but it cannot run server-side session logic by itself.

## 2. Product Goals

### Core goals

- Fast session join flow
- Real-time sync across multiple devices
- Clear, touch-friendly life counter UI
- Commander damage tracking
- Minimal setup during an in-person game
- Low hosting and maintenance overhead

### Non-goals for v1

- Turn tracking
- Poison counters
- Match history
- Offline-first sync
- Spectator mode
- Authentication accounts

Those can be added later after the base multiplayer session flow is stable.

## 3. Recommended Technical Approach

## Frontend

- **React + Vite + TypeScript**
- Deploy static build to **GitHub Pages**
- Use a lightweight styling approach:
  - plain CSS modules, or
  - Tailwind if you want faster UI iteration

Recommended default:

- React
- TypeScript
- plain CSS or a small component styling layer

Reasoning:

- Easy GitHub Pages deployment
- Good local dev experience
- Clear component model for session, lobby, and player controls

## Realtime backend

Recommended option for v1:

- **Firebase**

Use:

- Firebase Hosting is optional
- **Firestore** or **Realtime Database** for shared session state

Why Firebase is a strong fit:

- Works well with static frontends
- No custom server required for MVP
- Realtime sync is straightforward
- Good client SDK support
- Easy to secure by session-based rules later

Alternative:

- **Supabase**

Why it is also valid:

- Good Postgres-backed platform
- Realtime support
- Nice dashboard and SQL visibility

Recommendation:

- Start with **Firebase Realtime Database** or **Firestore**
- If you want the simplest live sync for a shared game state, Firebase is probably the fastest path

## 4. Core User Experience

### Landing flow (Main Menu)

1. User opens the site
2. User chooses to either:
   - **Create Game**: Select number of players (2-10), session is created with placeholder player cards
   - **Join Game**: Enter session code, player name, and join the session

### In-session flow

Users can:

- View all players
- Increase or decrease life totals
- Add or remove commander damage
- Edit player names
- Edit player colors
- Edit commander names and count (1 or 2)
- Reset life totals and commander damage (names/colors/commanders persist)

### Session assumptions for v1

- One shared game per session code
- Typical Commander pod size: 2 to 10 players
- Default starting life: 40
- Default commander count: 1
- Any player can edit any player card (per-card edit locking)
- Session closes when the creator's tab is closed

## 5. Functional Requirements

### Must-have

- Create session with player count selection (2-10)
- Join session by code
- Keep shared player list in sync
- Keep life totals in sync in real time
- Keep commander damage in sync in real time
- Allow player renaming
- Allow player color selection
- Allow commander damage assignment per opponent
- Allow 1 or 2 commanders per player
- Death detection (life ≤ 0 or any commander reaches 21 damage)
- Black out dead player cards (damage locked, removal still allowed)
- Allow session reset (life + commander damage)
- Handle reconnects reasonably well
- Desktop-optimized layout (mobile for future)

### Nice-to-have

- Copy/share session code
- Confirm reset before applying
- Show last updated timestamp
- Preserve local player identity in browser storage

## 6. Technical Constraints and Decisions

### Important architecture decision

Because the app is hosted on GitHub Pages:

- The app must be a static frontend
- Realtime state must live in an external service

This means the project should be split into:

- **Frontend app** hosted on GitHub Pages
- **Backend data layer** hosted elsewhere, likely Firebase

### Session code strategy

Sessions are created by the app, not by users. When a user creates a game:

1. User selects number of players (2-10)
2. App generates a 6-character uppercase code
3. Session is created with that many placeholder player cards

When joining:

- User enters the session code
- User enters their name
- User joins the existing session

### Identity strategy

For v1, avoid full login.

Use:

- Browser-local generated client id
- User-entered display name

This gives enough identity to reconnect and keep the UX simple.

### Edit locking

When a player is actively editing another player's card:

- The card is grayed out for other players
- A short timeout after last interaction releases the lock
- Prevents conflicting edits during rapid input

## 7. Suggested Data Model

Example session document shape:

```ts
type Session = {
  code: string;
  createdAt: number;
  updatedAt: number;
  status: "active" | "closed";
  creatorId: string;
  playerCount: number;
  players: Record<string, Player>;
};

type Player = {
  id: string;
  name: string;
  life: number;
  color: string;
  commanderCount: 1 | 2;
  commanders: Commander[];
  joinedAt: number;
  lastSeenAt: number;
  isDead: boolean;
};

type Commander = {
  id: string;
  name: string;
  damageToOpponents: Record<string, number>;
};
```

Potential storage layout:

```txt
sessions/
  {SESSION_CODE}/
    code
    createdAt
    updatedAt
    status
    creatorId
    playerCount
    players/
      {PLAYER_ID}/
        id
        name
        life
        color
        commanderCount
        commanders/
          {COMMANDER_ID}/
            id
            name
            damageToOpponents/
              {OPPONENT_ID}: damage
        joinedAt
        lastSeenAt
        isDead
```

## 8. App Pages and UI Structure

### Page 1: Main Menu

Purpose:

- Entry point with options to create or join a game

Elements:

- App title
- Create Game button → player count selection modal (2-10)
- Join Game button → session code input + player name input

### Page 2: Session Screen

Purpose:

- Show all players in the pod
- Allow editing shared game state

Elements:

- Session code header
- Reset button
- Player cards grid
- Life total display (center of card)
- Plus/minus controls (±1, ±5, ±10)
- Floating delta number on life change (2s animation)
- Commander damage section (expandable/floating menu)
- Editable player names and colors
- Death overlay on player cards

### Desktop UI recommendation

- Grid layout for player cards
- 2-column on smaller screens, 3+ columns on larger screens
- Large tap targets for life controls
- Commander damage in a collapsible section per card

## 9. State Management Plan

Frontend state should be separated into:

### Local UI state

- Form inputs
- Loading state
- Error messages
- Modal visibility
- Active edit lock state
- Floating delta number display

### Remote session state

- Session info
- Player list
- Life totals
- Commander damage
- Player colors

Recommendation:

- Use React state for local UI state
- Subscribe directly to Firebase for session state
- Only add a heavier state library if the app becomes more complex

## 10. Real-Time Update Rules

When a player changes a life total or commander damage:

1. Update the remote session state
2. All clients subscribed to that session receive the updated value
3. UI rerenders automatically

For v1, use last-write-wins behavior with per-card edit locking.

Edit locking prevents conflicts by:

- Graying out a card when another player is editing
- Releasing the lock after a short timeout of no interaction

This is acceptable because:

- Games are small
- Edit conflicts are rare with locking
- Simplicity matters more than perfect concurrency handling

## 11. Death Mechanics

### Death conditions

A player card is marked dead when:

- Life total reaches 0 or below
- Any single commander deals 21 or more damage to that player

### Dead card behavior

- Card is visually blacked out
- Commander damage cannot be added to dead players
- Commander damage can still be removed (to undo mistakes)
- Life can still be added or removed (to undo mistakes)
- Dead cards remain visible until session ends

### Game end

- Game continues until one player remains alive
- No automatic winner detection (players decide)

## 12. Reset Behavior

When the session is reset:

- All life totals return to 40
- All commander damage is cleared
- Names persist
- Colors persist
- Commander names persist
- Commander counts persist
- Dead states are cleared

## 13. Validation and Edge Cases

Handle these cases:

- Empty session code
- Empty player name
- Session code not found
- Duplicate names (allowed)
- User refreshes page
- User opens the same session in two tabs
- Network disconnect during play
- Reset triggered by mistake
- Attempting to add damage to dead player

## 14. Security and Abuse Considerations

For MVP, security can be lightweight, but not absent.

### Risks

- Random people guessing session codes
- Malicious edits if a code is shared publicly
- Session accumulation in the database

### Mitigations

- Use 6-character random session codes (sufficient entropy)
- Add basic database rules that limit writes to expected session shapes
- Sessions auto-close when creator leaves

## 15. Recommended MVP Scope

Keep MVP intentionally narrow:

- Main menu with Create Game / Join Game
- Create session with player count selection (2-10)
- Join session by code
- Add current player to session
- Display all players
- Edit player names and colors
- Increment and decrement life totals (±1, ±5, ±10)
- Floating delta number on life change (2s animation)
- Commander damage section (per-opponent damage tracking)
- Editable commander names and count (1-2)
- Death detection (life ≤ 0 or any commander hits 21)
- Dead cards blacked out (damage locked, removal allowed)
- Per-card edit locking
- Reset all players to 40 life and 0 commander damage
- Realtime sync across browsers
- Session closes when creator leaves

Do not add these in MVP:

- Commander damage win condition detection
- Turn tracking
- Poison counters
- Match notes
- Authentication
- Spectator mode
- Custom starting life
- Kick player functionality
- Mobile-optimized layout

## 16. Milestone Roadmap

### Milestone 1: Project setup

Goal:

- Establish the base frontend app and deployment path

Tasks:

- Initialize Vite + React + TypeScript project
- Set up GitHub repository structure
- Configure GitHub Pages deployment
- Add linting and formatting
- Create base app shell and routes

Deliverable:

- Static frontend deployed to GitHub Pages

### Milestone 2: Main menu and join flow

Goal:

- Build the entry experience without backend sync yet

Tasks:

- Create main menu with Create Game / Join Game
- Add player count selection modal
- Add session code input and player name input
- Add input validation
- Create local navigation into a mock session view

Deliverable:

- Usable frontend flow with fake local state

### Milestone 3: Session page UI

Goal:

- Build the player card grid and basic controls

Tasks:

- Create session screen layout
- Create player card component
- Add life controls (±1, ±5, ±10)
- Add floating delta number display
- Add name and color editing
- Mock death state styling

Deliverable:

- Static player cards with full UI, no backend

### Milestone 4: Realtime backend integration

Goal:

- Make sessions actually shared across devices

Tasks:

- Set up Firebase project
- Add Firebase SDK to frontend
- Implement create session logic with player count
- Implement join session logic
- Store player records in backend
- Subscribe to session updates

Deliverable:

- Two devices can join the same code and see the same session

### Milestone 5: Life counter interactions

Goal:

- Make the core gameplay loop usable

Tasks:

- Sync life changes to backend
- Sync floating delta animation
- Add reset action
- Add reset confirmation UX
- Implement per-card edit locking

Deliverable:

- Life counter feature complete with real-time sync

### Milestone 6: Commander damage

Goal:

- Add commander damage tracking

Tasks:

- Add commander section to player cards
- Allow 1-2 commanders per player
- Allow naming commanders
- Allow assigning damage per opponent
- Implement death detection (21 commander damage)
- Black out dead cards
- Block damage to dead players
- Allow damage removal from dead players

Deliverable:

- Commander damage feature complete

### Milestone 7: UX polish and resilience

Goal:

- Make the app reliable enough for real play

Tasks:

- Add loading and error states
- Persist client id and last-used name locally
- Handle reconnect state
- Improve desktop layout and readability

Deliverable:

- MVP ready for real-world testing

## 17. Suggested Folder Structure

Example frontend structure:

```txt
src/
  app/
    routes/
    providers/
  components/
    MainMenu/
    CreateGameModal/
    JoinForm/
    PlayerCard/
    LifeControls/
    CommanderSection/
    FloatingDelta/
    SessionHeader/
  features/
    session/
      api/
      hooks/
      types.ts
      utils.ts
  lib/
    firebase/
    storage/
  styles/
  main.tsx
```

## 18. Implementation Order

Recommended build order:

1. Create React app scaffold
2. Build main menu UI (Create Game / Join Game)
3. Build static session page UI with mock data
4. Define session, player, and commander types
5. Integrate Firebase
6. Implement create/join session logic
7. Implement real-time session subscription
8. Implement life total updates with floating delta
9. Implement edit locking
10. Implement commander damage section
11. Implement death detection and styling
12. Implement reset
13. Add local persistence and polish
14. Test on multiple browsers
15. Deploy production build to GitHub Pages

This sequence reduces risk because the UI and data model are clarified before realtime wiring.

## 19. Testing Plan

### Manual testing

You should test:

- Create a game from 2-10 players
- Join from two devices using the same session code
- Life changes syncing instantly both ways
- Floating delta numbers appearing and fading
- Name and color changes syncing correctly
- Commander setup (1-2 commanders)
- Commander damage assignment syncing
- Death triggering at life ≤ 0 and 21 commander damage
- Dead cards blocking further damage
- Dead cards allowing damage removal
- Reset working across all clients
- Refresh behavior
- Creator closing tab closes session

### Future automated tests

- Unit tests for validation and session utilities
- Component tests for player card and controls
- Integration tests around backend update flows where feasible

For MVP, manual multi-device testing is more important than heavy automated coverage.

## 20. Deployment Plan

### Frontend

- Build with Vite
- Deploy compiled static assets to GitHub Pages

### Backend

- Configure Firebase project separately
- Store API config in frontend environment variables as appropriate for the build setup

Important note:

- Client-side Firebase config is not secret in the traditional sense
- Security must come from database rules, not from hiding config values

## 21. Key Decisions To Lock Early

Before implementation, lock these decisions:

1. Use React + TypeScript for frontend
2. Use Firebase for shared realtime state
3. Sessions created by app with 6-character codes
4. 40 starting life by default
5. 1 or 2 commanders per player (user configurable)
6. Allow all players to edit all cards with per-card locking
7. Death at life ≤ 0 or any commander at 21 damage
8. Keep MVP limited to life, commander damage, names, colors, and reset
9. Desktop-first layout (mobile for future)

## 22. Success Criteria For MVP

The MVP is successful if:

- A player can create a game with 2-10 players
- Other players can join using a session code
- Everyone sees the same life totals update in real time
- Floating delta numbers show life changes
- Names and colors can be changed
- Commander damage can be tracked per opponent
- Players die correctly (life ≤ 0 or 21 commander damage)
- Dead cards are blacked out and block further damage
- The pod can reset to starting life without confusion
- Session closes when creator leaves

## 23. Immediate Next Steps

Recommended next actions:

1. Set up the frontend project with Vite + React + TypeScript
2. Create the main menu and static session screen
3. Define the TypeScript data model for sessions, players, and commanders
4. Create a Firebase project and connect the app
5. Test joining the same session from two browser windows
