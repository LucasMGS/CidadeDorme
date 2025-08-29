# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Cidade Dorme**, a Brazilian multiplayer Mafia/Werewolf game built with React, Firebase, and Tailwind CSS. Players join game rooms where they are assigned roles and participate in day/night cycles to eliminate opponents.

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Architecture

### Tech Stack
- **Frontend**: React 19.1.1 with Vite
- **Database**: Firebase Firestore for real-time game state
- **Authentication**: Firebase anonymous auth
- **Styling**: Tailwind CSS 4.1.12 with custom fonts (Jaini, Inter, IM Fell Great Primer)
- **Routing**: React Router DOM 7.8.2

### Key Architecture Patterns

**Game State Management**: The entire game state is stored in Firestore documents under the `games` collection. Each game has a unique room ID and contains:
- Player list with roles and status
- Current game phase (LOBBY, ROLE_REVEAL, NIGHT, DAY, GAME_OVER, etc.)
- Night action data, votes, game log, and history

**Real-time Updates**: Uses Firebase `onSnapshot` listeners for real-time game state synchronization across all players.

**Phase-Based Flow**: The game progresses through distinct phases:
1. **LOBBY** ’ players join
2. **ROLE_REVEAL** ’ players see their assigned roles  
3. **NIGHT** ’ special roles act in turn order
4. **DAY** ’ players discuss and vote
5. **GAME_OVER** ’ winner determination

**Role System**: Roles are defined in `src/constants/roles.js` with team assignments (good/evil). Role assignment logic in `src/utils/roleAssigner.js` scales based on player count.

### Component Structure

**Page Components** (`src/pages/`):
- `HomePage` - Landing page with background image
- `LobbyPage` - Wrapper for GameLobby component  
- `GamePage` - Main game controller with phase management

**Game Screen Components** (`src/components/`):
- `GameLobby` - Room creation/joining with game rules
- `LobbyScreen` - Player waiting room with host controls
- `NightScreen` - Role-specific night actions interface
- `DayScreen` - Voting interface with timer
- `GameOverScreen` - Results and new round options

**Key Files**:
- `src/firebase.js` - Firebase configuration with environment variables
- `src/utils/roleColors.js` - Role color definitions for UI consistency
- `src/App.jsx` - Router setup connecting pages

### Styling Conventions

- Uses Jaini font for main UI elements and buttons
- Standard button color: `#660708` (dark red) with `#520506` hover
- Background color: `#161A1D` for main screens
- Role colors: Lobo (#AC2748), Feiticeiro (#B938F5), Vidente (#2E69D8), Médico (#2ED86F), Caçador (#D8A22E), Aldeão (#FFFFFF)

### Environment Variables Required

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN  
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

### Important Game Logic

**Turn Order**: Night phases follow strict turn order: Vidente ’ Lobo ’ Feiticeira ’ Médico. Only alive players with these roles participate.

**Win Conditions**: 
- Good team wins when all evil players are eliminated
- Evil team wins when evil players equal/outnumber good players

**Special Role Mechanics**:
- Médico cannot protect the same player twice in a row
- Feiticeira has one-time use life/death potions
- Caçador gets revenge shot when eliminated
- IP restrictions limit one player per IP address