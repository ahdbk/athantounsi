# Playlist Video Player Implementation Plan

## Overview
Transform the milestone video player into a playlist-based system where:
- Videos are automatically discovered from the public folder
- Playlist order: video1 → video2 → video3
- Video2 starts playing at user-specified target time
- UI displays the full playlist
- Users can upload additional videos

## Core Logic Changes

### Current System
- Single video with milestone timing
- User sets milestone time within one video
- Calculates when to start that video

### New System
- Multiple video playlist (video1, video2, video3, ...)
- Video2 is the target video that must play at user-specified time
- Calculate when to start video1 so video2 begins at target time

## Implementation Steps

### 1. Playlist Discovery & Management
- Scan public folder for video files (mp4, webm, mov, etc.)
- Sort videos by filename (video1, video2, video3, ...)
- Create playlist state management
- Handle video upload and integration into playlist

### 2. Timing Logic Redesign
```
New Formula:
target-time = user-specified time when video2 should start
video1-duration = duration of video1
start-time = target-time - video1-duration
```

### 3. UI Components
- Playlist display showing all videos
- Current video indicator
- Upload functionality for new videos
- Target time input (when video2 should start)
- Start playlist button

### 4. Video Playback Management
- Sequential video playback
- Automatic transition between videos
- Progress tracking across entire playlist
- Jump to calculated start time functionality

## Technical Implementation

### State Structure
```typescript
interface PlaylistState {
  videos: VideoFile[];
  currentVideoIndex: number;
  targetTime: string; // when video2 should start
  calculatedStartTime: number;
  totalDuration: number;
}

interface VideoFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  order: number;
}
```

### Key Functions
- `discoverVideos()`: Scan public folder for videos
- `calculatePlaylistStartTime()`: Calculate when to start video1
- `handleVideoEnd()`: Transition to next video
- `uploadVideo()`: Add new video to playlist
- `updatePlaylist()`: Reorder and manage playlist

### API Endpoints (if needed)
- GET `/api/videos` - List videos in public folder
- POST `/api/videos/upload` - Handle video uploads

## File Changes Required

### New Files
- `src/hooks/usePlaylist.ts` - Playlist management hook
- `src/components/PlaylistDisplay.tsx` - Playlist UI component
- `src/utils/videoDiscovery.ts` - Video file discovery utilities
- `src/api/videos/route.ts` - Video management API

### Modified Files
- `src/components/VideoPlayer.tsx` - Core player logic update
- `src/app/page.tsx` - Integration of playlist functionality

## Testing Strategy
1. Test with 3 sample videos in public folder
2. Verify timing calculations for video2 start
3. Test video upload functionality
4. Test playlist navigation and display
5. Verify sequential playback transitions

## User Experience Flow
1. App loads and discovers videos in public folder
2. Displays playlist (video1, video2, video3, ...)
3. User sets target time for when video2 should start
4. App calculates when to begin video1
5. User clicks "Start Playlist"
6. Video1 plays, automatically transitions to video2 at target time
7. User can upload additional videos to extend playlist

## Edge Cases
- Handle missing videos (video1 or video2)
- Video upload errors
- Invalid target times
- Network issues during video discovery
- Videos longer than expected affecting timing