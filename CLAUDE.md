# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
A React video player application that calculates when to start videos so that specific milestones occur at user-specified target times. Built with Vite, React 19, TypeScript, and Tailwind CSS.

**Core Formula:**
```
delta-time = target-time - current-time
start-time = milestone-time - delta-time
```

## Development Commands
```bash
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:3000, auto-opens browser)
npm run build           # TypeScript compile + Vite build (outputs to dist/)
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

## Architecture

### Framework Setup
- **Build Tool**: Vite 5 (not Next.js - the README is outdated)
- **React**: 19.1.0 with TypeScript
- **Dev Server**: Configured to run on port 3000 with auto-open
- **Path Alias**: `@/` maps to `./src/`

### Application Structure

**Entry Point**: `src/main.tsx` → `src/App.tsx` → `src/components/VideoPlayer.tsx`

The app has two modes of operation:

#### 1. Single Video Mode (VideoPlayer.tsx)
Core video player with milestone scheduling. User sets a milestone timestamp within a video and specifies when that milestone should occur (clock time). The player calculates where to start the video so the milestone hits at the target time.

**Key State:**
- `milestoneTime`: Timestamp position in video (seconds)
- `targetTime`: Clock time when milestone should occur (HH:MM format)
- `calculatedStartTime`: Computed start position in video

**Interactive Canvas Timeline:**
- Real-time progress tracking (updates every 100ms)
- Click-to-seek functionality
- Visual milestone marker ("M" indicator)
- Grid markers at 10% intervals

#### 2. Playlist Mode (usePlaylist hook + PlaylistDisplay)
Multi-video playlist where video #2 must start at a specific clock time. Video #1 starts automatically at a calculated time to ensure video #2 begins exactly at the target time.

**Key Concepts:**
- `VideoFile`: Interface for playlist videos (id, name, url, duration, order)
- `PlaylistState`: Tracks videos array, currentVideoIndex, targetTime, calculatedStartTime
- `calculatePlaylistStartTime()`: Computes when video #1 must start so video #2 hits target time
- Auto-discovery pattern for videos in public folder (hardcoded for now)

**Playlist Logic Flow:**
1. Videos are loaded and durations captured via metadata
2. User sets target time for video #2 to start
3. System calculates: `startTime = video1.duration - deltaTime`
4. Video #1 begins at calculated position
5. When video #1 ends, video #2 starts automatically at target time

### Time Formatting
- Smart display: Shows MM:SS for videos under 1 hour, HH:MM:SS otherwise
- Input flexibility: Accepts both MM:SS and HH:MM:SS formats
- All internal calculations use seconds

### File Management
Video files are gitignored (see `.gitignore` lines 44-52). Common video formats (mp4, mov, avi, mkv, webm, flv, wmv, m4v) are excluded from version control to prevent repository bloat.

## Planning Convention
Before implementing features, create a detailed plan in `claude/tasks/TASK_NAME.md` with:
- Implementation step breakdown
- Approach reasoning
- Task checklist

## Technical Notes
- Uses Lucide React for icons
- Canvas-based timeline rendering (HTML5 Canvas API)
- HTML5 video element with custom controls
- Tailwind CSS 3 for styling (not v4 as INSTRUCTIONS.md incorrectly states)
- TypeScript strict mode enabled