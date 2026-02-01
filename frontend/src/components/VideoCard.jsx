import React from 'react';
import { Play, Eye } from 'lucide-react';
import { getSavedProgress } from './PlayerView';

const VideoCard = ({ video, channel, compact = false, onPlay, theme }) => {
  const API_URL = import.meta.env.VITE_API_URL || '/api';
  
  const isDark = theme === 'dark';
  const bgCard = isDark ? 'bg-zinc-900/50' : 'bg-white';
  const border = isDark ? 'border-zinc-800' : 'border-gray-200';
  const text = isDark ? 'text-zinc-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const textTertiary = isDark ? 'text-zinc-500' : 'text-gray-500';
  const cardHover = isDark ? 'hover:bg-zinc-800/80' : 'hover:bg-gray-50';

  const thumbnailUrl = video.thumbnail 
    ? `${API_URL}/thumbnail/${channel.folder}/${video.thumbnail}`
    : null;

  // Check for saved watch progress
  const saved = getSavedProgress(video.id);
  const hasProgress = saved && saved.currentTime > 3 && saved.duration > 0;
  const progressPercent = hasProgress ? (saved.currentTime / saved.duration) * 100 : 0;

  return (
    <div
      onClick={() => onPlay(video, channel)}
      className={`${bgCard} rounded-xl overflow-hidden cursor-pointer border ${border} transition-all ${cardHover} group ${
        compact ? 'flex gap-4' : ''
      }`}
    >
      <div className={`relative ${compact ? 'w-48' : 'aspect-video'} bg-zinc-800 flex-shrink-0`}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-12 h-12 text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Play className="w-16 h-16 text-white/0 group-hover:text-white/90 transition-all transform scale-75 group-hover:scale-100" />
        </div>

        {/* Bottom row: progress bar track + badges */}
        <div className="absolute bottom-0 left-0 right-0">
          {/* Progress bar */}
          {hasProgress && (
            <div className="w-full h-1 bg-black/40">
              <div
                className="h-full bg-red-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Badge row */}
          <div className={`flex items-end justify-between px-2 ${hasProgress ? 'pb-1.5 pt-1' : 'py-1.5'}`}>
            {hasProgress && (
              <span className="bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
                Continue
              </span>
            )}
            {/* push duration to the right even when no progress badge */}
            {!hasProgress && <span />}
            {video.duration && (
              <span className="bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                {video.duration}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 flex-1">
        <h3 className={`font-semibold ${text} mb-2 line-clamp-2 group-hover:text-red-500 transition-colors`}>
          {video.title}
        </h3>
        <div className={`flex items-center gap-2 text-sm ${textSecondary}`}>
          <span>{channel.name}</span>
          {video.uploadDate && video.uploadDate !== 'Unknown' && (
            <>
              <span>•</span>
              <span>{video.uploadDate}</span>
            </>
          )}
        </div>
        {video.viewCount > 0 && (
          <div className={`flex items-center gap-1 text-sm ${textTertiary} mt-1`}>
            <Eye className="w-4 h-4" />
            <span>{video.viewCount.toLocaleString()} views</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
