import React from 'react';
import { ChevronLeft, Edit2, Tag, Grid, List } from 'lucide-react';
import ChannelCard from './ChannelCard';
import VideoCard from './VideoCard';

const CategoryView = ({ 
  category, 
  channels, 
  gridView, 
  setGridView, 
  onBack, 
  onEdit, 
  onChannelClick,
  playVideo,
  theme 
}) => {
  const isDark = theme === 'dark';
  const bgCard = isDark ? 'bg-zinc-900/50' : 'bg-white';
  const border = isDark ? 'border-zinc-800' : 'border-gray-200';
  const text = isDark ? 'text-zinc-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const textTertiary = isDark ? 'text-zinc-500' : 'text-gray-500';
  const hover = isDark ? 'hover:bg-zinc-800' : 'hover:bg-gray-100';

  if (!category) return null;

  const categoryChannels = channels.filter(ch => 
    category.channelIds.includes(ch.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`${textSecondary} ${hover} p-2 rounded-lg`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h2 className={`text-3xl font-bold ${text}`}>{category.name}</h2>
              <p className={`${textSecondary}`}>
                {categoryChannels.length} channel{categoryChannels.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onEdit}
          className={`flex items-center gap-2 ${hover} px-4 py-2 rounded-lg ${textSecondary}`}
        >
          <Edit2 className="w-5 h-5" />
          Edit
        </button>
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

      {categoryChannels.length === 0 ? (
        <div className={`text-center py-20 ${bgCard} rounded-2xl border ${border}`}>
          <Tag className={`w-20 h-20 mx-auto mb-4 ${textTertiary}`} />
          <p className={`text-lg ${text} font-semibold`}>No channels in this category</p>
          <p className={`${textSecondary} mt-2`}>Edit the category to add channels</p>
        </div>
      ) : (
        <>
          <div>
            <h3 className={`text-2xl font-bold ${text} mb-4`}>Channels</h3>
            <div className={`grid gap-4 ${gridView ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {categoryChannels.map(channel => (
                <ChannelCard 
                  key={channel.id} 
                  channel={channel} 
                  onClick={onChannelClick}
                  theme={theme}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className={`text-2xl font-bold ${text} mb-4`}>All Videos</h3>
            <div className={`grid gap-4 ${gridView ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {categoryChannels.flatMap(channel =>
                channel.videos.map(video => (
                  <VideoCard 
                    key={`${channel.id}-${video.id}`} 
                    video={video} 
                    channel={channel} 
                    compact={!gridView}
                    onPlay={playVideo}
                    theme={theme}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryView;
