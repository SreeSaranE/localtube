import React from 'react';
import { ChevronLeft, Grid, List } from 'lucide-react';
import VideoCard from './VideoCard';

const ChannelView = ({ 
  channel, 
  searchQuery, 
  gridView, 
  setGridView, 
  onBack, 
  playVideo,
  theme 
}) => {
  const API_URL = import.meta.env.VITE_API_URL || '/api';
  
  const isDark = theme === 'dark';
  const text = isDark ? 'text-zinc-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const hover = isDark ? 'hover:bg-zinc-800' : 'hover:bg-gray-100';

  if (!channel) return null;

  const avatarUrl = channel.avatar 
    ? `${API_URL}/channel-avatar/${channel.folder}/${channel.avatar}`
    : null;

  const filterVideos = (videos) => {
    if (!searchQuery.trim()) return videos;
    return videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const filteredVideos = filterVideos(channel.videos);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`${textSecondary} ${hover} p-2 rounded-lg`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={channel.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-white">
              {channel.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h2 className={`text-3xl font-bold ${text}`}>{channel.name}</h2>
          <p className={`${textSecondary}`}>
            {channel.videos.length} video{channel.videos.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setGridView(true)}
          className={`p-2 rounded-lg ${gridView ? 'bg-red-600 text-white' : `${textSecondary} ${hover}`}`}
        >
          <Grid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setGridView(false)}
          className={`p-2 rounded-lg ${!gridView ? 'bg-red-600 text-white' : `${textSecondary} ${hover}`}`}
        >
          <List className="w-5 h-5" />
        </button>
      </div>

      <div className={`grid gap-4 ${gridView ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredVideos.map(video => (
          <VideoCard 
            key={video.id} 
            video={video} 
            channel={channel} 
            compact={!gridView}
            onPlay={playVideo}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
};

export default ChannelView;
