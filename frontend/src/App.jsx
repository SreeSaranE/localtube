import React, { useState, useEffect, useRef } from 'react';
import { Play, Home, Clock, Grid, List, Search, ChevronLeft, X, Trash2, ExternalLink, Plus, Edit2, Tag, TrendingUp, Video, Sparkles, Calendar, Eye } from 'lucide-react';

const API_URL = 'http://localhost:3001';

const App = () => {
  const [view, setView] = useState('home');
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [watchHistory, setWatchHistory] = useState([]);
  const [deletedVideos, setDeletedVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gridView, setGridView] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  // Auto theme based on time
  useEffect(() => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      const autoTheme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
      setTheme(autoTheme);
    };
    
    updateTheme();
    const interval = setInterval(updateTheme, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch channels from backend
  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/channels`);
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load saved data
  useEffect(() => {
    const savedHistory = localStorage.getItem('localtube_history');
    if (savedHistory) setWatchHistory(JSON.parse(savedHistory));
    
    const savedDeleted = localStorage.getItem('localtube_deleted');
    if (savedDeleted) setDeletedVideos(JSON.parse(savedDeleted));
    
    const savedCategories = localStorage.getItem('localtube_categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories([
        { id: 'gaming', name: 'Gaming', channelIds: [], icon: '🎮' },
        { id: 'finance', name: 'Finance', channelIds: [], icon: '💰' },
        { id: 'tech', name: 'Tech', channelIds: [], icon: '💻' }
      ]);
    }
  }, []);

  const addToHistory = (video, channel) => {
    const entry = {
      videoId: video.id,
      videoTitle: video.title,
      channelName: channel.name,
      watchedAt: new Date().toISOString()
    };
    
    const newHistory = [entry, ...watchHistory.filter(h => h.videoId !== video.id)].slice(0, 50);
    setWatchHistory(newHistory);
    localStorage.setItem('localtube_history', JSON.stringify(newHistory));
  };

  const addToDeleted = (video, channel) => {
    const entry = {
      videoId: video.id,
      videoTitle: video.title,
      channelName: channel.name,
      deletedAt: new Date().toISOString()
    };

    const filtered = deletedVideos.filter(
      v => v.videoId !== video.id
    );

    const newDeleted = [entry, ...filtered];

    setDeletedVideos(newDeleted);
    localStorage.setItem('localtube_deleted', JSON.stringify(newDeleted));
  };

  const openOnYouTube = (videoTitle, channelName) => {
    const searchQuery = `${channelName} ${videoTitle}`;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    window.open(url, '_blank');
  };

  const saveCategories = (newCategories) => {
    setCategories(newCategories);
    localStorage.setItem('localtube_categories', JSON.stringify(newCategories));
  };

  const addCategory = (name, icon) => {
    const newCategory = {
      id: Date.now().toString(),
      name,
      channelIds: [],
      icon: icon || '📁'
    };
    saveCategories([...categories, newCategory]);
  };

  const updateCategory = (categoryId, updates) => {
    saveCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, ...updates } : cat
    ));
  };

  const deleteCategory = (categoryId) => {
    saveCategories(categories.filter(cat => cat.id !== categoryId));
  };

  const toggleChannelInCategory = (categoryId, channelId) => {
    const category = categories.find(c => c.id === categoryId);
    const channelIds = category.channelIds.includes(channelId)
      ? category.channelIds.filter(id => id !== channelId)
      : [...category.channelIds, channelId];
    
    updateCategory(categoryId, { channelIds });
  };

  const playVideo = (video, channel) => {
    setSelectedVideo({ ...video, channelName: channel.name, channelFolder: channel.folder });
    setView('player');
    addToHistory(video, channel);
  };

  const filteredChannels = channels.filter(ch =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.videos.some(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-zinc-950' : 'bg-gray-50';
  const bgSecondary = isDark ? 'bg-zinc-900' : 'bg-white';
  const bgTertiary = isDark ? 'bg-zinc-800' : 'bg-gray-100';
  const bgCard = isDark ? 'bg-zinc-900/50' : 'bg-white';
  const border = isDark ? 'border-zinc-800' : 'border-gray-200';
  const text = isDark ? 'text-zinc-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const textTertiary = isDark ? 'text-zinc-500' : 'text-gray-500';
  const hover = isDark ? 'hover:bg-zinc-800' : 'hover:bg-gray-100';
  const cardHover = isDark ? 'hover:bg-zinc-800/80' : 'hover:bg-gray-50';

  const VideoCard = ({ video, channel, compact = false }) => {
    const thumbnailUrl = video.thumbnail 
      ? `${API_URL}/api/thumbnail/${channel.folder}/${video.thumbnail}`
      : null;

    return (
      <div
        onClick={() => playVideo(video, channel)}
        className={`${bgCard} backdrop-blur-sm rounded-xl overflow-hidden cursor-pointer ${cardHover} transition-all duration-200 border ${border} ${
          compact ? 'flex gap-4' : 'group'
        }`}
      >
        <div className={`relative ${
          compact ? 'w-48 h-28 flex-shrink-0' : 'aspect-video'
        }`}>
          {thumbnailUrl ? (
            <>
              <img 
                src={thumbnailUrl} 
                alt={video.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </>
          ) : (
            <div className={`w-full h-full ${bgTertiary} flex items-center justify-center`}>
              <Video className={`w-16 h-16 ${textTertiary}`} />
            </div>
          )}
          
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-md">
            {video.duration}
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-red-600/90 backdrop-blur-sm rounded-full p-4">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        </div>
        
        <div className="p-4 flex-1">
          <h3 className={`font-semibold ${text} line-clamp-2 mb-2 ${compact ? 'text-base' : 'text-sm'} leading-tight`}>
            {video.title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            {channel.avatar ? (
                <img
                    src={`${API_URL}/api/channel-avatar/${channel.folder}/${channel.avatar}`}
                    className="w-6 h-6 rounded-full object-cover"
                    alt={channel.name}
                />
                ) : (
                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {channel.name.charAt(0)}
                </div>
                )}
            <p className={`text-sm ${textSecondary} font-medium`}>{channel.name}</p>
          </div>
          <div className={`flex items-center gap-3 text-xs ${textTertiary}`}>
            {video.uploadDate !== 'Unknown' && (
              <>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{video.uploadDate}</span>
                </div>
              </>
            )}
            {video.viewCount > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{video.viewCount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CategoryModal = () => {
    const [newCatName, setNewCatName] = useState('');
    const [newCatIcon, setNewCatIcon] = useState('📁');
    const [editName, setEditName] = useState('');

    const iconOptions = ['📁', '🎮', '💰', '💻', '🎵', '🎬', '📚', '🏃', '🍳', '✈️', '🎨', '📰', '🔬', '⚽'];

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCategoryModal(false)}>
        <div className={`${bgSecondary} rounded-2xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl border ${border}`} onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-3xl font-bold ${text} flex items-center gap-3`}>
                <Sparkles className="w-8 h-8 text-red-500" />
                Manage Categories
              </h2>
              <p className={`${textSecondary} mt-1`}>Organize your channels into custom categories</p>
            </div>
            <button onClick={() => setShowCategoryModal(false)} className={`${textSecondary} ${hover} p-2 rounded-lg`}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-8">
            <label className={`block text-sm font-medium ${text} mb-3`}>Create New Category</label>
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className={`${bgTertiary} border ${border} rounded-lg px-3 py-3 text-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500`}
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Category name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newCatName.trim()) {
                    addCategory(newCatName.trim(), newCatIcon);
                    setNewCatName('');
                  }
                }}
                className={`flex-1 ${bgTertiary} border ${border} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 ${text}`}
              />
              <button
                onClick={() => {
                  if (newCatName.trim()) {
                    addCategory(newCatName.trim(), newCatIcon);
                    setNewCatName('');
                  }
                }}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {categories.map(cat => (
              <div key={cat.id} className={`${bgTertiary} rounded-xl p-5 border ${border}`}>
                <div className="flex items-center justify-between mb-4">
                  {editingCategory === cat.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => {
                        if (editName.trim()) {
                          updateCategory(cat.id, { name: editName.trim() });
                        }
                        setEditingCategory(null);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && editName.trim()) {
                          updateCategory(cat.id, { name: editName.trim() });
                          setEditingCategory(null);
                        }
                      }}
                      autoFocus
                      className={`${bgSecondary} border ${border} rounded-lg px-3 py-2 ${text} font-semibold`}
                    />
                  ) : (
                    <h3 className={`font-bold ${text} text-lg flex items-center gap-2`}>
                      <span className="text-2xl">{cat.icon || '📁'}</span>
                      {cat.name}
                      <span className={`text-xs ${textTertiary} ml-2 px-2 py-1 rounded-full ${bgSecondary}`}>
                        {cat.channelIds.length} channels
                      </span>
                    </h3>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(cat.id);
                        setEditName(cat.name);
                      }}
                      className={`${textSecondary} hover:text-blue-500 p-2 rounded-lg ${hover}`}
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className={`${textSecondary} hover:text-red-500 p-2 rounded-lg ${hover}`}
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {channels.map(ch => (
                    <label key={ch.id} className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg ${hover} transition-colors`}>
                      <input
                        type="checkbox"
                        checked={cat.channelIds.includes(ch.id)}
                        onChange={() => toggleChannelInCategory(cat.id, ch.id)}
                        className="w-5 h-5 accent-red-600 cursor-pointer"
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                          {ch.name.charAt(0)}
                        </div>
                        <span className={`text-sm ${text} font-medium truncate`}>{ch.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const HomeView = () => {
    const allVideos = channels.flatMap(ch =>
      ch.videos.map(v => ({ ...v, channel: ch }))
    ).sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-3xl font-bold ${text} flex items-center gap-3`}>
              <TrendingUp className="w-8 h-8 text-red-500" />
              Latest Videos
            </h2>
            <p className={`${textSecondary} mt-1`}>Your newest downloads</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setGridView(true)}
              className={`p-3 rounded-lg transition-all ${gridView ? 'bg-red-600 text-white shadow-lg' : `${bgTertiary} ${textSecondary}`}`}
              title="Grid View"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setGridView(false)}
              className={`p-3 rounded-lg transition-all ${!gridView ? 'bg-red-600 text-white shadow-lg' : `${bgTertiary} ${textSecondary}`}`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-solid border-red-600 border-r-transparent"></div>
            <p className={`mt-4 ${textSecondary} font-medium`}>Loading your library...</p>
          </div>
        ) : allVideos.length === 0 ? (
          <div className={`text-center py-20 ${bgCard} rounded-2xl border ${border}`}>
            <Video className={`w-20 h-20 mx-auto mb-4 ${textTertiary}`} />
            <p className={`text-lg ${text} font-semibold`}>No videos found</p>
            <p className={`${textSecondary} mt-2`}>Start downloading videos to see them here</p>
          </div>
        ) : (
          <div className={gridView ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {allVideos.map(v => (
              <VideoCard key={`${v.channel.id}-${v.id}`} video={v} channel={v.channel} compact={!gridView} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const CategoryView = () => {
    if (!selectedCategory) return null;

    const categoryChannels = channels.filter(ch => selectedCategory.channelIds.includes(ch.id));
    const categoryVideos = categoryChannels.flatMap(ch =>
      ch.videos.map(v => ({ ...v, channel: ch }))
    ).sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    return (
      <div className="space-y-6">
        <button
          onClick={() => setView('home')}
          className={`flex items-center gap-2 ${textSecondary} hover:${text} font-medium transition-colors`}
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold ${text} flex items-center gap-3`}>
              <span className="text-5xl">{selectedCategory.icon || '📁'}</span>
              {selectedCategory.name}
            </h1>
            <p className={`${textSecondary} mt-2`}>
              {categoryVideos.length} videos from {categoryChannels.length} channels
            </p>
          </div>
        </div>

        <div className={gridView ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {categoryVideos.map(v => (
            <VideoCard key={`${v.channel.id}-${v.id}`} video={v} channel={v.channel} compact={!gridView} />
          ))}
        </div>
      </div>
    );
  };

  const ChannelsView = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-3xl font-bold ${text}`}>Subscriptions</h2>
        <p className={`${textSecondary} mt-1`}>All your channels in one place</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {filteredChannels.map(ch => (
          <div
            key={ch.id}
            onClick={() => { setSelectedChannel(ch); setView('channel'); }}
            className={`${bgCard} rounded-2xl p-6 cursor-pointer ${cardHover} transition-all duration-200 text-center border ${border} group`}
          >
            {ch.avatar ? (
                <img
                    src={`${API_URL}/api/channel-avatar/${ch.folder}/${ch.avatar}`}
                    className="w-24 h-24 mx-auto rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform duration-200"
                    alt={ch.name}
                />
                ) : (
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {ch.name.charAt(0)}
                </div>
                )}
            <h3 className={`font-bold ${text} mb-2 truncate`}>{ch.name}</h3>
            <p className={`text-sm ${textSecondary}`}>{ch.videos.length} videos</p>
          </div>
        ))}
      </div>
    </div>
  );

  const ChannelView = () => {
    if (!selectedChannel) return null;

    return (
      <div className="space-y-6">
        <button
          onClick={() => setView('channels')}
          className={`flex items-center gap-2 ${textSecondary} hover:${text} font-medium transition-colors`}
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Channels
        </button>

        <div className="flex items-center gap-6">
          {selectedChannel.avatar ? (
            <img
                src={`${API_URL}/api/channel-avatar/${selectedChannel.folder}/${selectedChannel.avatar}`}
                className="w-32 h-32 rounded-2xl object-cover shadow-2xl"
                alt={selectedChannel.name}
            />
            ) : (
            <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-5xl font-bold text-white shadow-2xl">
                {selectedChannel.name.charAt(0)}
            </div>
            )}
          <div>
            <h1 className={`text-4xl font-bold ${text}`}>{selectedChannel.name}</h1>
            <p className={`${textSecondary} mt-2 text-lg`}>{selectedChannel.videos.length} videos</p>
          </div>
        </div>

        <div className={gridView ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {selectedChannel.videos.map(v => (
            <VideoCard key={v.id} video={v} channel={selectedChannel} compact={!gridView} />
          ))}
        </div>
      </div>
    );
  };

  const HistoryView = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-3xl font-bold ${text} flex items-center gap-3`}>
          <Clock className="w-8 h-8 text-red-500" />
          Watch History
        </h2>
        <p className={`${textSecondary} mt-1`}>Videos you've watched recently</p>
      </div>
      {watchHistory.length === 0 ? (
        <div className={`text-center py-20 ${bgCard} rounded-2xl border ${border}`}>
          <Clock className={`w-20 h-20 mx-auto mb-4 ${textTertiary}`} />
          <p className={`text-lg ${text} font-semibold`}>No watch history yet</p>
          <p className={`${textSecondary} mt-2`}>Start watching videos to build your history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {watchHistory.map((entry, idx) => {
            const channel = channels.find(ch => ch.name === entry.channelName);
            const video = channel?.videos.find(v => v.id === entry.videoId);
            if (!video || !channel) return null;
            
            return (
              <div key={idx} className={`flex items-center gap-6 ${bgCard} rounded-xl p-4 border ${border}`}>
                <div className="flex-1">
                  <VideoCard video={video} channel={channel} compact />
                </div>
                <div className={`text-sm ${textTertiary} whitespace-nowrap text-right`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(entry.watchedAt).toLocaleDateString()}
                  </div>
                  <div className={`text-xs mt-1 ${textTertiary}`}>
                    {new Date(entry.watchedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const DeletedLogsView = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-3xl font-bold ${text} flex items-center gap-3`}>
          <Trash2 className="w-8 h-8 text-red-500" />
          Deleted Videos Log
        </h2>
        <p className={`${textSecondary} mt-1`}>Keep track of videos you've removed</p>
      </div>
      {deletedVideos.length === 0 ? (
        <div className={`text-center py-20 ${bgCard} rounded-2xl border ${border}`}>
          <Trash2 className={`w-20 h-20 mx-auto mb-4 ${textTertiary}`} />
          <p className={`text-lg ${text} font-semibold`}>No deleted videos logged</p>
          <p className={`${textSecondary} mt-2`}>Mark videos as deleted to track them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deletedVideos.map((entry, idx) => (
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
                onClick={() => openOnYouTube(entry.videoTitle, entry.channelName)}
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

    const PlayerView = () => {
        if (!selectedVideo) return null;

        const videoUrl = `${API_URL}/api/video/${selectedVideo.channelFolder}/${selectedVideo.file}`;

        const subtitleUrl = selectedVideo.subtitle
        ? `${API_URL}/api/subtitle/${selectedVideo.channelFolder}/${selectedVideo.subtitle}`
        : null;

        return (
        <div className="space-y-6">
            <button
            onClick={() => setView('home')}
            className={`flex items-center gap-2 ${textSecondary} hover:${text}`}
            >
            <ChevronLeft className="w-5 h-5" />
            Back
            </button>

            <div className={`${bgCard} p-4 rounded-2xl border ${border}`}>
            <video
                ref={videoRef}
                controls
                autoPlay
                className="w-full rounded-xl"
            >
                <source src={videoUrl} type="video/mp4" />
                {subtitleUrl && (
                <track
                    src={subtitleUrl}
                    kind="subtitles"
                    srcLang="en"
                    default
                />
                )}
            </video>

            <div className="mt-4 flex items-center justify-between">
                <div>
                <h1 className={`text-2xl font-bold ${text}`}>
                    {selectedVideo.title}
                </h1>
                <p className={`${textSecondary}`}>
                    {selectedVideo.channelName}
                </p>
                </div>

                <button
                  onClick={async () => {
                    await fetch(
                      `${API_URL}/api/video/${selectedVideo.channelFolder}/${selectedVideo.id}`,
                      { method: 'DELETE' }
                    );

                    addToDeleted(selectedVideo, {
                      name: selectedVideo.channelName,
                    });

                    fetchChannels(); // refresh UI
                    setView('home');
                  }}

                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
                >
                <Trash2 className="w-5 h-5" />
                Mark Deleted
                </button>
            </div>
            </div>
        </div>
        );
    };

    const SidebarButton = ({ icon: Icon, label, active, onClick }) => (
        <button
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
            active
            ? 'bg-red-600 text-white'
            : `${textSecondary} ${hover}`
        }`}
        >
        <Icon className="w-5 h-5" />
        {label}
        </button>
    );

    return (
        <div className={`min-h-screen flex ${bg}`}>
        {/* Sidebar */}
        <div className={`w-64 p-4 border-r ${border} ${bgSecondary} space-y-2`}>
            <h1 className="text-2xl font-bold text-red-600 mb-6">LocalTube</h1>

            <SidebarButton icon={Home} label="Home" active={view === 'home'} onClick={() => setView('home')} />
            <SidebarButton icon={Video} label="Channels" active={view === 'channels'} onClick={() => setView('channels')} />
            <SidebarButton icon={Clock} label="History" active={view === 'history'} onClick={() => setView('history')} />
            <SidebarButton icon={Trash2} label="Deleted" active={view === 'deleted'} onClick={() => setView('deleted')} />

            <div className="pt-4 border-t border-zinc-700">
            <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-red-500 hover:bg-red-500/10"
            >
                <Tag className="w-5 h-5" />
                Manage Categories
            </button>

            {categories.map(cat => (
                <button
                key={cat.id}
                onClick={() => {
                    setSelectedCategory(cat);
                    setView('category');
                }}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg ${hover} ${textSecondary}`}
                >
                <span>{cat.icon}</span>
                {cat.name}
                </button>
            ))}
            </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">

            {/* Search */}
            <div className={`${bgSecondary} p-4 rounded-xl border ${border} flex items-center gap-3`}>
            <Search className={`${textSecondary}`} />
            <input
                placeholder="Search videos or channels..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${text}`}
            />
            </div>

            {view === 'home' && <HomeView />}
            {view === 'channels' && <ChannelsView />}
            {view === 'channel' && <ChannelView />}
            {view === 'player' && <PlayerView />}
            {view === 'history' && <HistoryView />}
            {view === 'deleted' && <DeletedLogsView />}
            {view === 'category' && <CategoryView />}

        </div>

        {showCategoryModal && <CategoryModal />}
        </div>
    );
};
export default App;
