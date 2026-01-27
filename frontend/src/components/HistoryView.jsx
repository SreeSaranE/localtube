import React from 'react';
import { Clock, Grid, List, Play } from 'lucide-react';

const HistoryView = ({ 
  watchHistory, 
  searchQuery, 
  gridView, 
  setGridView, 
  onPlayFromHistory,
  theme 
}) => {
  const API_URL = import.meta.env.VITE_API_URL || '/api';
  
  const isDark = theme === 'dark';
  const bgCard = isDark ? 'bg-zinc-900/50' : 'bg-white';
  const border = isDark ? 'border-zinc-800' : 'border-gray-200';
  const text = isDark ? 'text-zinc-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const textTertiary = isDark ? 'text-zinc-500' : 'text-gray-500';
  const cardHover = isDark ? 'hover:bg-zinc-800/80' : 'hover:bg-gray-50';

  const filteredHistory = watchHistory.filter(entry =>
    !searchQuery ||
    entry.videoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.channelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const HistoryVideoCard = ({ entry, compact = false }) => {
    const thumbnailUrl = entry.thumbnail 
      ? `${API_URL}/thumbnail/${entry.channelFolder}/${entry.thumbnail}`
      : null;

    return (
      <div
        onClick={() => onPlayFromHistory(entry)}
        className={`${bgCard} rounded-xl overflow-hidden cursor-pointer border ${border} transition-all ${cardHover} group ${
          compact ? 'flex gap-4' : ''
        }`}
      >
        <div className={`relative ${compact ? 'w-48' : 'aspect-video'} bg-zinc-800 flex-shrink-0`}>
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={entry.videoTitle}
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
          {entry.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {entry.duration}
            </div>
          )}
        </div>
        <div className="p-4 flex-1">
          <h3 className={`font-semibold ${text} mb-2 line-clamp-2 group-hover:text-red-500 transition-colors`}>
            {entry.videoTitle}
          </h3>
          <div className={`flex items-center gap-2 text-sm ${textSecondary}`}>
            <span>{entry.channelName}</span>
            <span>•</span>
            <span>{new Date(entry.watchedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold ${text} flex items-center gap-3`}>
            <Clock className="w-8 h-8 text-red-500" />
            Watch History
          </h2>
          <p className={`${textSecondary} mt-1`}>Your recently watched videos</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGridView(true)}
            className={`p-2 rounded-lg ${gridView ? 'bg-red-600 text-white' : `${textSecondary} hover:bg-zinc-800`}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setGridView(false)}
            className={`p-2 rounded-lg ${!gridView ? 'bg-red-600 text-white' : `${textSecondary} hover:bg-zinc-800`}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className={`text-center py-20 ${bgCard} rounded-2xl border ${border}`}>
          <Clock className={`w-20 h-20 mx-auto mb-4 ${textTertiary}`} />
          <p className={`text-lg ${text} font-semibold`}>
            {searchQuery ? 'No matching history' : 'No watch history'}
          </p>
          <p className={`${textSecondary} mt-2`}>
            {searchQuery ? 'Try a different search term' : 'Videos you watch will appear here'}
          </p>
        </div>
      ) : (
        <div className={`grid gap-4 ${gridView ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredHistory.map((entry, idx) => (
            <HistoryVideoCard key={idx} entry={entry} compact={!gridView} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
