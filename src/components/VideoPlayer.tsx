'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface MilestoneConfig {
  milestoneTime: number; // in seconds
  targetTime: string; // time in format "HH:MM"
}

const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoSrc, setVideoSrc] = useState('/video.mp4');
  const [milestoneConfig, setMilestoneConfig] = useState<MilestoneConfig>({
    milestoneTime: 1800, // 30 minutes in seconds - will be updated when video loads
    targetTime: '13:00'
  });
  const [calculatedStartTime, setCalculatedStartTime] = useState<number | null>(null);

  // Time calculation logic
  const calculateStartTime = () => {
    const currentDate = new Date();
    const [targetHours, targetMinutes] = milestoneConfig.targetTime.split(':').map(Number);

    const targetDate = new Date();
    targetDate.setHours(targetHours, targetMinutes, 0, 0);

    // If target time is tomorrow
    if (targetDate <= currentDate) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const deltaTime = (targetDate.getTime() - currentDate.getTime()) / 1000; // in seconds
    const startTime = milestoneConfig.milestoneTime - deltaTime;

    return Math.max(0, startTime); // Don't go negative
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const generateTimelinePreviews = () => {
    if (!videoRef.current || !canvasRef.current || duration === 0) return;

    const video = videoRef.current;
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

    // Draw milestone marker
    const milestoneX = (milestoneConfig.milestoneTime / duration) * canvas.width;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(milestoneX - 3, 0, 6, canvas.height);

    // Draw milestone label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('M', milestoneX, canvas.height - 15);

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
  };

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

      // Set milestone to middle of video if current milestone is beyond video duration
      if (milestoneConfig.milestoneTime > videoDuration) {
        setMilestoneConfig(prev => ({
          ...prev,
          milestoneTime: Math.floor(videoDuration / 2)
        }));
      }
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
    const startTime = calculateStartTime();
    setCalculatedStartTime(startTime);

    if (videoRef.current && startTime >= 0) {
      videoRef.current.currentTime = startTime;
      setCurrentTime(startTime);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };

  useEffect(() => {
    generateTimelinePreviews();
  }, [duration, currentTime, milestoneConfig]);

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
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Video Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video Source
        </label>
        <div className="flex gap-4 items-center mb-3">
          <button
            onClick={() => setVideoSrc('/video.mp4')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Use Sample Video
          </button>
          <span className="text-gray-500">or</span>
        </div>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Milestone Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Milestone Time
          </label>
          <input
            type="range"
            min="0"
            max={duration || 3600}
            step="1"
            value={milestoneConfig.milestoneTime}
            onChange={(e) => setMilestoneConfig(prev => ({
              ...prev,
              milestoneTime: parseInt(e.target.value)
            }))}
            className="w-full mb-2"
          />
          <div className="flex justify-between items-center">
            <input
              type="text"
              value={formatTime(milestoneConfig.milestoneTime)}
              onChange={(e) => {
                const timeStr = e.target.value;
                const parts = timeStr.split(':').map(Number);
                let totalSeconds = 0;

                if (parts.length === 2) {
                  const [mins, secs] = parts;
                  if (!isNaN(mins) && !isNaN(secs)) {
                    totalSeconds = (mins * 60) + secs;
                  }
                } else if (parts.length === 3) {
                  const [hours, mins, secs] = parts;
                  if (!isNaN(hours) && !isNaN(mins) && !isNaN(secs)) {
                    totalSeconds = (hours * 3600) + (mins * 60) + secs;
                  }
                }

                if (totalSeconds > 0) {
                  setMilestoneConfig(prev => ({
                    ...prev,
                    milestoneTime: Math.min(totalSeconds, duration || 3600)
                  }));
                }
              }}
              placeholder="MM:SS or HH:MM:SS"
              className="px-3 py-1 border border-gray-300 rounded text-sm w-32"
            />
            <span className="text-sm text-gray-500">
              / {formatTime(duration)}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Time (HH:MM)
          </label>
          <input
            type="time"
            value={milestoneConfig.targetTime}
            onChange={(e) => setMilestoneConfig(prev => ({
              ...prev,
              targetTime: e.target.value
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Calculate Start Time Button */}
      <div className="mb-6">
        <button
          onClick={jumpToCalculatedStart}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
        >
          <RotateCcw size={16} />
          Calculate & Jump to Start Time
        </button>
        {calculatedStartTime !== null && (
          <p className="mt-2 text-sm text-gray-600">
            Calculated start time: {formatTime(calculatedStartTime)}
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
            <span>Milestone: {formatTime(milestoneConfig.milestoneTime)}</span>
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
            Current: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;