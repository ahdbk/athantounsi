'use client';

import { VideoFile } from '@/hooks/usePlaylist';
import { Play, Upload } from 'lucide-react';

interface PlaylistDisplayProps {
  videos: VideoFile[];
  currentVideoIndex: number;
  onVideoSelect: (index: number) => void;
  onVideoUpload: (file: File) => void;
}

const PlaylistDisplay = ({
  videos,
  currentVideoIndex,
  onVideoSelect,
  onVideoUpload
}: PlaylistDisplayProps) => {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onVideoUpload(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Video Playlist</h2>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2">
            <Upload size={16} />
            Add Video
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No videos found. Upload a video to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {videos.map((video, index) => (
            <div
              key={video.id}
              onClick={() => onVideoSelect(index)}
              className={`
                flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200
                ${index === currentVideoIndex
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{video.name}</p>
                  {video.duration > 0 && (
                    <p className="text-sm text-gray-500">
                      Duration: {formatTime(video.duration)}
                    </p>
                  )}
                  {index === 1 && (
                    <p className="text-xs text-green-600 font-semibold">
                      🎯 Target Video (plays at specified time)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {index === currentVideoIndex && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Play size={16} />
                    <span className="text-sm font-medium">Current</span>
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  #{video.order}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {videos.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Playlist Logic:</strong> Video #{videos[1]?.order || 2} will start playing at your specified target time.
            Video #{videos[0]?.order || 1} will start automatically to ensure perfect timing.
          </p>
        </div>
      )}
    </div>
  );
};

export default PlaylistDisplay;