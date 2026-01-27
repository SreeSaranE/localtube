import React from 'react';
import { Video, Grid, List } from 'lucide-react';
import ChannelCard from './ChannelCard';

const ChannelsView = ({ 
  channels, 
  loading, 
  searchQuery, 
  gridView, 
  setGridView, 
  onChannelClick,
  theme 
}) => {
  const isDark = theme === 'dark';
  const bgCard = isDark ? 'bg-zinc-900/50' : 'bg-white';
  const border = isDark ? 'border-zinc-800' : 'border-gray-200';
  const text = isDark ? 'text-zinc-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const textTertiary = isDark ? 'text-zinc-500' : 'text-gray-500';

  const filteredChannels = channels.filter(ch =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.videos.some(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-3xl font-bold ${text} flex items-center gap-3`}>
          <Video className="w-8 h-8 text-red-500" />
          All Channels
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : filteredChannels.length === 0 ? (
        <div className={`text-center py-20 ${bgCard} rounded-2xl border ${border}`}>
          <Video className={`w-20 h-20 mx-auto mb-4 ${textTertiary}`} />
          <p className={`text-lg ${text} font-semibold`}>No channels found</p>
          <p className={`${textSecondary} mt-2`}>
            {searchQuery ? 'Try a different search term' : 'Add some videos to your library to get started'}
          </p>
        </div>
      ) : (
        <div className={`grid gap-4 ${gridView ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredChannels.map(channel => (
            <ChannelCard 
              key={channel.id} 
              channel={channel} 
              onClick={onChannelClick}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChannelsView;
