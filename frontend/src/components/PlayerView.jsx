import React, { useRef } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';

const PlayerView = ({ 
  video, 
  onBack, 
  onDelete, 
  theme 
}) => {
  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const videoRef = useRef(null);
  
  const isDark = theme === 'dark';
  const bgCard = isDark ? 'bg-zinc-900/50' : 'bg-white';
  const border = isDark ? 'border-zinc-800' : 'border-gray-200';
  const text = isDark ? 'text-zinc-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';

  if (!video) return null;

  const videoUrl = `${API_URL}/video/${video.channelFolder}/${video.file}`;
  const subtitleUrl = video.subtitle
    ? `${API_URL}/subtitle/${video.channelFolder}/${video.subtitle}`
    : null;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 ${textSecondary} hover:${text}`}
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <div className="flex justify-center">
        <div className={`${bgCard} p-4 rounded-2xl border ${border} w-full max-w-4xl`}>
          <video
            ref={videoRef}
            controls
            autoPlay
            className="w-full aspect-video rounded-xl bg-black"
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
              onClick={onDelete}
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

export default PlayerView;
