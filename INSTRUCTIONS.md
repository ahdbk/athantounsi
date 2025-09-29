# Milestone Video Player - Instructions

## Project Overview
A Next.js video player application that allows users to schedule video milestones to play at specific target times. The app calculates when to start a video so that an important milestone (timestamp) occurs at a user-specified target time.

## Core Formula
```
delta-time = target-time - current-time
start-time = milestone-time - delta-time
```

**Example:**
- Current time: 12:30
- Target time: 13:00
- Milestone at: 30 minutes into video
- Delta time: 30 minutes (13:00 - 12:30)
- Start time: 0 minutes (30 min milestone - 30 min delta = 0)

## Features Implemented

### 1. Video Player Component (`src/components/VideoPlayer.tsx`)
- **Video Upload**: Users can upload video files or use sample video
- **Timeline Preview**: Interactive canvas timeline with live progress tracking
- **Milestone Configuration**: Set milestone time using slider + text input (HH:MM:SS format)
- **Target Time Setting**: Set when you want the milestone to occur (HH:MM format)
- **Smart Calculation**: Automatically calculates optimal start time
- **Live Progress**: Real-time timeline updates every 100ms while playing

### 2. Time Management
- **Format**: Smart HH:MM:SS display (shows MM:SS for videos under 1 hour)
- **Input Flexibility**: Accepts both MM:SS and HH:MM:SS input formats
- **Duration-Based**: Milestone picker adapts to actual video duration
- **Auto-Adjustment**: Sets milestone to video middle if initial value exceeds duration

### 3. Interactive Timeline
- **Visual Progress**: Blue progress bar fills as video plays
- **Milestone Marker**: Red "M" marker shows milestone position
- **Playhead**: Moving circle with current time label
- **Seeking**: Click anywhere on timeline to jump to that position
- **Grid Markers**: Visual markers every 10% of video duration

### 4. User Interface
- **Clean Design**: Tailwind CSS styling with responsive layout
- **Control Buttons**: Play/pause and calculate start time buttons
- **Real-time Display**: Current time, target time, and calculated start time
- **File Handling**: Support for local video uploads

## Technical Stack
- **Framework**: Next.js 15.5.4 with TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Canvas**: HTML5 Canvas for timeline rendering
- **Video**: HTML5 video element with custom controls

## File Structure
```
src/
├── app/
│   ├── page.tsx          # Main page component
│   ├── layout.tsx        # App layout
│   └── globals.css       # Global styles
├── components/
│   └── VideoPlayer.tsx   # Main video player component
public/
├── sample-video-info.txt # Video usage instructions
└── [video files]         # User-provided video files (gitignored)
```

## Development Commands
```bash
npm install              # Install dependencies
npm run dev             # Start development server (http://localhost:3000)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

## Key Components

### VideoPlayer State Management
```typescript
interface MilestoneConfig {
  milestoneTime: number;  // in seconds
  targetTime: string;     // format "HH:MM"
}
```

### Core Functions
- `calculateStartTime()`: Implements the main formula
- `formatTime()`: Handles HH:MM:SS display logic
- `generateTimelinePreviews()`: Renders interactive timeline
- `handleSeek()`: Manages timeline clicking/seeking
- `jumpToCalculatedStart()`: Applies calculated start time

### Real-time Updates
- `useEffect` with 100ms interval for smooth progress tracking
- Canvas redraws on currentTime, duration, or milestone changes
- Live timeline progress bar and playhead movement

## Usage Instructions
1. **Load Video**: Upload a video file or click "Use Sample Video"
2. **Set Milestone**: Use slider or text input to set milestone time in video
3. **Set Target**: Choose when you want the milestone to occur (clock time)
4. **Calculate**: Click "Calculate & Jump to Start Time"
5. **Play**: Video starts at calculated position to hit milestone at target time

## Configuration Notes
- Video files are gitignored to prevent large uploads
- Default milestone starts at 30 minutes (adjusted to video middle if too long)
- Timeline updates every 100ms for smooth progress
- Supports videos of any length with smart time formatting

## Future Enhancements
- Multiple milestone support
- Thumbnail previews on timeline
- Playlist functionality
- Export/import milestone configurations
- Video speed controls

## Dependencies
```json
{
  "next": "15.5.4",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "lucide-react": "^0.544.0",
  "typescript": "^5",
  "tailwindcss": "^4"
}
```

---

**Generated with Claude Code** - An interactive video player for milestone scheduling