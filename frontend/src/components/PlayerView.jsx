import React, { useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';

// Shared helpers — used by both PlayerView and VideoCard
export const getProgressKey = (videoId) => `localtube_progress_${videoId}`;

export const getSavedProgress = (videoId) => {
  try {
    const raw = localStorage.getItem(getProgressKey(videoId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveProgress = (videoId, currentTime, duration) => {
  // Don't save if less than 3 seconds in or within last 5 seconds (basically finished)
  if (currentTime < 3 || (duration - currentTime) < 5) {
    localStorage.removeItem(getProgressKey(videoId));
    return;
  }
  localStorage.setItem(getProgressKey(videoId), JSON.stringify({ currentTime, duration }));
};

export const clearProgress = (videoId) => {
  localStorage.removeItem(getProgressKey(videoId));
};

const PlayerView = ({ 
  video, 
  onBack, 
  onDelete, 
  theme 
}) => {
  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const videoRef = useRef(null);
  const saveIntervalRef = useRef(null);
  
  const isDark = theme === 'dark';
  const bgCard = isDark ? 'bg-zinc-900/50' : 'bg-white';
  const border = isDark ? 'border-zinc-800' : 'border-gray-200';
  const text = isDark ? 'text-zinc-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';

  // Restore saved progress once the video is ready to play
  const handleLoadedMetadata = useCallback(() => {
    const el = videoRef.current;
    if (!el || !video) return;
    const saved = getSavedProgress(video.id);
    if (saved && saved.currentTime > 0) {
      el.currentTime = saved.currentTime;
    }
  }, [video]);

  // Start periodic save; stop on unmount
  useEffect(() => {
    if (!video) return;

    saveIntervalRef.current = setInterval(() => {
      const el = videoRef.current;
      if (el && !el.paused) {
        saveProgress(video.id, el.currentTime, el.duration);
      }
    }, 5000); // every 5 seconds

    return () => clearInterval(saveIntervalRef.current);
  }, [video]);

  // Clear progress when video ends naturally
  const handleEnded = useCallback(() => {
    if (video) clearProgress(video.id);
  }, [video]);

  // Also save once on pause so short pauses don't lose position
  const handlePause = useCallback(() => {
    const el = videoRef.current;
    if (el && video) {
      saveProgress(video.id, el.currentTime, el.duration);
    }
  }, [video]);

  if (!video) return null;

  const videoUrl = `${API_URL}/video/${video.channelFolder}/${video.file}`;
  const subtitleUrl = video.subtitle
    ? `${API_URL}/subtitle/${video.channelFolder}/${video.subtitle}`
    : null;

  const saved = getSavedProgress(video.id);
  const hasProgress = saved && saved.currentTime > 3;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 ${textSecondary} hover:text-zinc-100`}
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <div className="flex justify-center">
        <div className={`${bgCard} p-4 rounded-2xl border ${border} w-full max-w-4xl`}>

          {/* "Continue from X:XX" banner */}
          {hasProgress && (
            <div className="mb-3 flex items-center justify-between bg-red-600/15 border border-red-600/30 rounded-lg px-4 py-2">
              <span className={`text-sm font-medium text-red-400`}>
                Resuming from {formatTime(saved.currentTime)}
              </span>
              <button
                onClick={() => {
                  const el = videoRef.current;
                  if (el) el.currentTime = 0;
                  clearProgress(video.id);
                }}
                className="text-xs text-red-400 hover:text-red-300 underline"
              >
                Start over
              </button>
            </div>
          )}

          <video
            ref={videoRef}
            controls
            autoPlay
            className="w-full aspect-video rounded-xl bg-black"
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onPause={handlePause}
          >
            <source src={videoUrl} type="video/mp4" />
            {subtitleUrl && (
              <track
                src={subtitleUrl}
                kind="subtitles"
                srcLang="en"
                label="English"
                default
              />
            )}
          </video>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className={`text-xl font-semibold ${text} truncate`}>
                {video.title}
              </h1>
              <p className={`${textSecondary} truncate mt-1`}>
                {video.channelName}
              </p>
            </div>

            <button
              onClick={() => {
                clearProgress(video.id);
                onDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 flex-shrink-0"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper: seconds → "M:SS" or "H:MM:SS"
function formatTime(sec) {
  if (!sec) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

export default PlayerView;
