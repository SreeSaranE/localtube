import React from 'react';

const ChannelCard = ({ channel, onClick, theme }) => {
  const API_URL = import.meta.env.VITE_API_URL || '/api';
  
  const isDark = theme === 'dark';
  const bgCard = isDark ? 'bg-zinc-900/50' : 'bg-white';
  const border = isDark ? 'border-zinc-800' : 'border-gray-200';
  const text = isDark ? 'text-zinc-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const cardHover = isDark ? 'hover:bg-zinc-800/80' : 'hover:bg-gray-50';

  const avatarUrl = channel.avatar 
    ? `${API_URL}/channel-avatar/${channel.folder}/${channel.avatar}`
    : null;

  return (
    <div
      onClick={() => onClick(channel)}
      className={`${bgCard} rounded-xl p-6 cursor-pointer border ${border} transition-all ${cardHover} group`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={channel.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-white">
              {channel.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-xl font-bold ${text} truncate group-hover:text-red-500 transition-colors`}>
            {channel.name}
          </h3>
          <p className={`${textSecondary}`}>
            {channel.videos.length} video{channel.videos.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChannelCard;
