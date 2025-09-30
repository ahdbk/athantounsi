'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { usePlaylist } from '@/hooks/usePlaylist';
import PlaylistDisplay from './PlaylistDisplay';

const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoSrc, setVideoSrc] = useState('');
  const [calculatedStartTime, setCalculatedStartTime] = useState<number | null>(null);

  const {
    playlist,
    updateVideoDuration,
    calculatePlaylistStartTime,
    addVideoToPlaylist,
    setCurrentVideo,
    setTargetTime,
    getNextVideo,
    nextVideo
  } = usePlaylist();

  // Get current video from playlist
  const getCurrentVideo = useCallback(() => {
    return playlist.videos[playlist.currentVideoIndex];
  }, [playlist.videos, playlist.currentVideoIndex]);

  // Handle video end - move to next video
  const handleVideoEnd = () => {
    const nextVid = getNextVideo();
    if (nextVid) {
      nextVideo();
    } else {
      setIsPlaying(false);
    }
  };

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  }, []);

  const generateTimelinePreviews = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || duration === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background progress bar
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, canvas.height - 8, canvas.width, 8);

    // Draw played portion
    const playedWidth = (currentTime / duration) * canvas.width;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, canvas.height - 8, playedWidth, 8);

    // Draw timeline markers every 10% of duration
    const markerCount = 10;
    for (let i = 0; i <= markerCount; i++) {
      const x = (canvas.width / markerCount) * i;
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(x - 1, 0, 2, canvas.height - 10);
    }

    // Draw video transition marker (for video2 start time in playlist mode)
    if (playlist.videos.length >= 2) {
      const video1Duration = playlist.videos[0]?.duration || 0;
      if (playlist.currentVideoIndex === 0 && video1Duration > 0) {
        const transitionX = (video1Duration / duration) * canvas.width;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(transitionX - 3, 0, 6, canvas.height);

        // Draw transition label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('V2', transitionX, canvas.height - 15);
      }
    }

    // Draw current playhead
    const currentX = (currentTime / duration) * canvas.width;
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(currentX - 2, 0, 4, canvas.height);

    // Draw playhead handle
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(currentX, 10, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Draw current time label
    ctx.fillStyle = '#1f2937';
    ctx.font = '10px Arial';
    ctx.textAlign = currentX < 50 ? 'left' : currentX > canvas.width - 50 ? 'right' : 'center';
    const timeLabel = formatTime(currentTime);
    const labelX = currentX < 50 ? currentX + 10 : currentX > canvas.width - 50 ? currentX - 10 : currentX;
    ctx.fillText(timeLabel, labelX, 25);
  }, [duration, currentTime, playlist, formatTime]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);

      // Update duration in playlist
      updateVideoDuration(playlist.currentVideoIndex, videoDuration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / canvas.width) * duration;

    videoRef.current.currentTime = clickTime;
    setCurrentTime(clickTime);
  };

  const jumpToCalculatedStart = () => {
    if (playlist.videos.length >= 2) {
      const startTime = calculatePlaylistStartTime();
      setCalculatedStartTime(startTime);

      // Start from video1 at calculated time
      setCurrentVideo(0);
      if (videoRef.current && startTime >= 0) {
        videoRef.current.currentTime = startTime;
        setCurrentTime(startTime);

        // Auto-play the playlist
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVideoSelect = (index: number) => {
    setCurrentVideo(index);
  };

  const handleVideoUpload = (file: File) => {
    addVideoToPlaylist(file);
  };

  // Update video source when current video changes
  useEffect(() => {
    const currentVideo = getCurrentVideo();
    if (currentVideo) {
      setVideoSrc(currentVideo.url);
    }
  }, [playlist.currentVideoIndex, playlist.videos, getCurrentVideo]);

  useEffect(() => {
    generateTimelinePreviews();
  }, [generateTimelinePreviews]);

  // Update timeline more frequently when playing
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      const interval = setInterval(() => {
        setCurrentTime(videoRef.current?.currentTime || 0);
      }, 100); // Update every 100ms for smooth progress

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <div className="space-y-6">
      {/* Playlist Display */}
      <PlaylistDisplay
        videos={playlist.videos}
        currentVideoIndex={playlist.currentVideoIndex}
        onVideoSelect={handleVideoSelect}
        onVideoUpload={handleVideoUpload}
      />

      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Target Time Configuration */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Time - When Video2 Should Start (HH:MM)
          </label>
          <input
            type="time"
            value={playlist.targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-600 mt-1">
            Video2 will automatically start playing at this time. Video1 will begin earlier to ensure perfect timing.
          </p>
        </div>

        {/* Calculate Start Time Button */}
        <div className="mb-6">
          <button
            onClick={jumpToCalculatedStart}
            disabled={playlist.videos.length < 2}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Calculate & Auto-Play Playlist
          </button>
          {calculatedStartTime !== null && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                Video1 will start at: {formatTime(calculatedStartTime)}
              </p>
              <p className="text-sm text-green-600">
                Video2 will start at: {playlist.targetTime}
              </p>
            </div>
          )}
          {playlist.videos.length < 2 && (
            <p className="mt-2 text-sm text-red-600">
              Need at least 2 videos in playlist to calculate timing
            </p>
          )}
        </div>

        {/* Video Player */}
        {videoSrc && (
          <div className="mb-4">
            <video
              ref={videoRef}
              src={videoSrc}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleVideoEnd}
              className="w-full rounded-lg"
              controls={false}
            />
          </div>
        )}

        {/* Timeline Preview */}
        {duration > 0 && (
          <div className="mb-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={60}
              onClick={handleSeek}
              className="w-full h-15 bg-gray-200 rounded cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0:00</span>
              <span>
                {playlist.currentVideoIndex === 0 && playlist.videos.length >= 2
                  ? `Video2 starts: ${formatTime(playlist.videos[0]?.duration || 0)}`
                  : `Video ${playlist.currentVideoIndex + 1}`
                }
              </span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        {videoSrc && (
          <div className="flex items-center justify-between">
            <button
              onClick={handlePlayPause}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors duration-200"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            <div className="flex-1 mx-4">
              <div className="text-sm text-gray-600">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <div>Video {playlist.currentVideoIndex + 1} of {playlist.videos.length}</div>
              <div>Current: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;