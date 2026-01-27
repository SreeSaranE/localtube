import React from 'react';
import { Trash2, ExternalLink, Calendar } from 'lucide-react';

const DeletedLogsView = ({ 
  deletedVideos, 
  searchQuery, 
  onOpenYouTube,
  theme 
}) => {
  const isDark = theme === 'dark';
  const bgCard = isDark ? 'bg-zinc-900/50' : 'bg-white';
  const border = isDark ? 'border-zinc-800' : 'border-gray-200';
  const text = isDark ? 'text-zinc-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const textTertiary = isDark ? 'text-zinc-500' : 'text-gray-500';
  const hover = isDark ? 'hover:bg-zinc-800' : 'hover:bg-gray-100';

  const filteredDeleted = deletedVideos.filter(entry =>
    !searchQuery ||
    entry.videoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.channelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-3xl font-bold ${text} flex items-center gap-3`}>
          <Trash2 className="w-8 h-8 text-red-500" />
          Deleted Videos Log
        </h2>
        <p className={`${textSecondary} mt-1`}>Keep track of videos you've removed</p>
      </div>
      
      {filteredDeleted.length === 0 ? (
        <div className={`text-center py-20 ${bgCard} rounded-2xl border ${border}`}>
          <Trash2 className={`w-20 h-20 mx-auto mb-4 ${textTertiary}`} />
          <p className={`text-lg ${text} font-semibold`}>
            {searchQuery ? 'No matching deleted videos' : 'No deleted videos logged'}
          </p>
          <p className={`${textSecondary} mt-2`}>
            {searchQuery ? 'Try a different search term' : 'Deleted videos will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDeleted.map((entry, idx) => (
            <div key={idx} className={`${bgCard} rounded-xl p-6 flex items-center justify-between border ${border} ${hover} transition-colors`}>
              <div className="flex-1 min-w-0 mr-4">
                <h3 className={`font-semibold ${text} mb-2 truncate`}>{entry.videoTitle}</h3>
                <div className={`flex items-center gap-4 text-sm ${textSecondary}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {entry.channelName.charAt(0)}
                    </div>
                    <span>{entry.channelName}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(entry.deletedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onOpenYouTube(entry.videoTitle, entry.channelName)}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-lg transition-all shadow-lg font-semibold whitespace-nowrap"
              >
                <ExternalLink className="w-5 h-5" />
                Find on YouTube
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeletedLogsView;
