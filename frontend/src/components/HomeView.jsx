import React from 'react';
import { Sparkles, Video, Play, Clock, Grid, List, AlertCircle } from 'lucide-react';
import VideoCard from './VideoCard';

const HomeView = ({ 
  channels, 
  loading, 
  error, 
  searchQuery, 
  gridView, 
  setGridView, 
  playVideo, 
  watchHistory, 
  fetchChannels,
  theme 
}) => {
  const isDark = theme === 'dark';
  const bgCard = isDark ? 'bg-zinc-900/50' : 'bg-white';
  const border = isDark ? 'border-zinc-800' : 'border-gray-200';
  const text = isDark ? 'text-zinc-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const textTertiary = isDark ? 'text-zinc-500' : 'text-gray-500';

  const filterVideos = (videos) => {
    if (!searchQuery.trim()) return videos;
    return videos.filter(v =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.channel?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className={`${text} text-lg`}>Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${bgCard} rounded-2xl p-8 border ${border}`}>
        <div className="flex items-center gap-3 text-red-500 mb-4">
          <AlertCircle className="w-8 h-8" />
          <h3 className="text-xl font-bold">Connection Error</h3>
        </div>
        <p className={`${text} mb-4`}>{error}</p>
        <button
          onClick={fetchChannels}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Get all videos from all channels
  const allVideos = channels.flatMap(ch => 
    ch.videos.map(v => ({ ...v, channel: ch }))
  );

  // Sort by upload date (most recent first)
  const sortedVideos = [...allVideos].sort((a, b) => 
    b.uploadDate.localeCompare(a.uploadDate)
  );

  // Filter videos based on search query
  const displayVideos = filterVideos(sortedVideos);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-3xl font-bold ${text} flex items-center gap-3`}>
            <Sparkles className="w-8 h-8 text-red-500" />
            Your Library
          </h2>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`${bgCard} rounded-xl p-6 border ${border}`}>
            <div className="flex items-center gap-3">
              <Video className="w-8 h-8 text-red-500" />
              <div>
                <p className={`text-3xl font-bold ${text}`}>{channels.length}</p>
                <p className={`${textSecondary}`}>Channels</p>
              </div>
            </div>
          </div>
          <div className={`${bgCard} rounded-xl p-6 border ${border}`}>
            <div className="flex items-center gap-3">
              <Play className="w-8 h-8 text-red-500" />
              <div>
                <p className={`text-3xl font-bold ${text}`}>{allVideos.length}</p>
                <p className={`${textSecondary}`}>Videos</p>
              </div>
            </div>
          </div>
          <div className={`${bgCard} rounded-xl p-6 border ${border}`}>
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-red-500" />
              <div>
                <p className={`text-3xl font-bold ${text}`}>{watchHistory.length}</p>
                <p className={`${textSecondary}`}>Watch History</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Videos Section */}
      <div>
        <h3 className={`text-2xl font-bold ${text} mb-4 flex items-center gap-2`}>
          <Play className="w-6 h-6 text-red-500" />
          {searchQuery ? 'Search Results' : 'All Videos'}
          <span className={`text-lg ${textSecondary} font-normal`}>
            ({displayVideos.length})
          </span>
        </h3>
        
        {displayVideos.length === 0 ? (
          <div className={`text-center py-20 ${bgCard} rounded-2xl border ${border}`}>
            <Video className={`w-20 h-20 mx-auto mb-4 ${textTertiary}`} />
            <p className={`text-lg ${text} font-semibold`}>
              {searchQuery ? 'No videos found' : 'No videos in your library'}
            </p>
            <p className={`${textSecondary} mt-2`}>
              {searchQuery ? 'Try a different search term' : 'Add some videos to get started'}
            </p>
          </div>
        ) : (
          <div className={`grid gap-4 ${gridView ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {displayVideos.map(video => (
              <VideoCard 
                key={`${video.channel.id}-${video.id}`} 
                video={video} 
                channel={video.channel} 
                compact={!gridView}
                onPlay={playVideo}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;
