'use client';

import { useState, useEffect } from 'react';

export interface VideoFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  order: number;
}

export interface PlaylistState {
  videos: VideoFile[];
  currentVideoIndex: number;
  targetTime: string; // when video2 should start
  calculatedStartTime: number;
  totalDuration: number;
}

export const usePlaylist = () => {
  const [playlist, setPlaylist] = useState<PlaylistState>({
    videos: [],
    currentVideoIndex: 0,
    targetTime: '13:00',
    calculatedStartTime: 0,
    totalDuration: 0
  });

  // Discover videos from public folder
  const discoverVideos = async () => {
    try {
      // For now, we'll use the known videos. In a real app, this would be an API call
      const videoFiles = [
        { name: 'video.mp4', order: 1 },
        { name: 'video2.mp4', order: 2 },
        { name: 'video3.mp4', order: 3 }
      ];

      const videos: VideoFile[] = videoFiles.map((file, index) => ({
        id: `video-${index + 1}`,
        name: file.name,
        url: `/${file.name}`,
        duration: 0, // Will be updated when video loads
        order: file.order
      }));

      setPlaylist(prev => ({
        ...prev,
        videos: videos.sort((a, b) => a.order - b.order)
      }));
    } catch (error) {
      console.error('Error discovering videos:', error);
    }
  };

  // Update video duration when metadata loads
  const updateVideoDuration = (videoIndex: number, duration: number) => {
    setPlaylist(prev => {
      const updatedVideos = [...prev.videos];
      updatedVideos[videoIndex] = { ...updatedVideos[videoIndex], duration };

      const totalDuration = updatedVideos.reduce((sum, video) => sum + video.duration, 0);

      return {
        ...prev,
        videos: updatedVideos,
        totalDuration
      };
    });
  };

  // Calculate when to start video1 so video2 starts at target time
  const calculatePlaylistStartTime = () => {
    const currentDate = new Date();
    const [targetHours, targetMinutes] = playlist.targetTime.split(':').map(Number);

    const targetDate = new Date();
    targetDate.setHours(targetHours, targetMinutes, 0, 0);

    // If target time is tomorrow
    if (targetDate <= currentDate) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const deltaTime = (targetDate.getTime() - currentDate.getTime()) / 1000; // in seconds

    // Get duration of video1 (first video)
    const video1Duration = playlist.videos[0]?.duration || 0;

    // Start time = target time - video1 duration
    const startTime = Math.max(0, video1Duration - deltaTime);

    setPlaylist(prev => ({
      ...prev,
      calculatedStartTime: startTime
    }));

    return startTime;
  };

  // Add uploaded video to playlist
  const addVideoToPlaylist = (file: File) => {
    const url = URL.createObjectURL(file);
    const newVideo: VideoFile = {
      id: `uploaded-${Date.now()}`,
      name: file.name,
      url: url,
      duration: 0,
      order: playlist.videos.length + 1
    };

    setPlaylist(prev => ({
      ...prev,
      videos: [...prev.videos, newVideo]
    }));
  };

  // Set current video index
  const setCurrentVideo = (index: number) => {
    setPlaylist(prev => ({
      ...prev,
      currentVideoIndex: index
    }));
  };

  // Set target time for video2
  const setTargetTime = (time: string) => {
    setPlaylist(prev => ({
      ...prev,
      targetTime: time
    }));
  };

  // Get next video in playlist
  const getNextVideo = () => {
    if (playlist.currentVideoIndex < playlist.videos.length - 1) {
      return playlist.videos[playlist.currentVideoIndex + 1];
    }
    return null;
  };

  // Move to next video
  const nextVideo = () => {
    if (playlist.currentVideoIndex < playlist.videos.length - 1) {
      setPlaylist(prev => ({
        ...prev,
        currentVideoIndex: prev.currentVideoIndex + 1
      }));
    }
  };

  // Initialize playlist on mount
  useEffect(() => {
    discoverVideos();
  }, []);

  return {
    playlist,
    updateVideoDuration,
    calculatePlaylistStartTime,
    addVideoToPlaylist,
    setCurrentVideo,
    setTargetTime,
    getNextVideo,
    nextVideo,
    discoverVideos
  };
};