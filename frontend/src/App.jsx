import React, { useState, useEffect } from 'react';
import { Home, Clock, Search, Tag, Video, Trash2 } from 'lucide-react';

// Import all view components
import HomeView from './components/HomeView';
import ChannelsView from './components/ChannelsView';
import ChannelView from './components/ChannelView';
import PlayerView from './components/PlayerView';
import HistoryView from './components/HistoryView';
import DeletedLogsView from './components/DeletedLogsView';
import CategoryView from './components/CategoryView';
import CategoryModal from './components/CategoryModal';

const API_URL = import.meta.env.VITE_API_URL || '/api';

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
  const [error, setError] = useState(null);

  // System theme detection
  useEffect(() => {
    const updateTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    };
    
    updateTheme();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Fetch channels from backend
  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/channels`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Error fetching channels:', error);
      setError(`Failed to connect to backend server. Make sure the backend is running on port 3001.`);
    } finally {
      setLoading(false);
    }
  };

  // Load saved data
  useEffect(() => {
    fetch(`${API_URL}/history`)
      .then(r => r.json())
      .then(setWatchHistory)
      .catch(() => setWatchHistory([]));

    fetch(`${API_URL}/deleted`)
      .then(r => r.json())
      .then(setDeletedVideos)
      .catch(() => setDeletedVideos([]));

    const savedCategories = localStorage.getItem('localtube_categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories([]);
    }
  }, []);

  const addToHistory = (video, channel) => {
    const entry = {
      videoId: video.id,
      videoTitle: video.title,
      channelName: channel.name,
      channelFolder: channel.folder,
      videoFile: video.file,
      thumbnail: video.thumbnail,
      duration: video.duration,
      watchedAt: new Date().toISOString()
    };
    
    const newHistory = [entry, ...watchHistory.filter(h => h.videoId !== video.id)].slice(0, 50);
    setWatchHistory(newHistory);

    fetch(`${API_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHistory)
    });
  };

  const addToDeleted = (video, channel) => {
    const entry = {
      videoId: video.id,
      videoTitle: video.title,
      channelName: channel.name,
      deletedAt: new Date().toISOString()
    };

    const filtered = deletedVideos.filter(v => v.videoId !== video.id);
    const newDeleted = [entry, ...filtered];
    setDeletedVideos(newDeleted);

    fetch(`${API_URL}/deleted`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDeleted)
    });
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

  const addCategory = (name, icon, channelIds = []) => {
    const newCategory = {
      id: Date.now().toString(),
      name,
      channelIds,
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

  const playVideo = (video, channel) => {
    setSelectedVideo({ ...video, channelName: channel.name, channelFolder: channel.folder });
    setView('player');
    addToHistory(video, channel);
  };

  const playFromHistory = (entry) => {
    const video = {
      id: entry.videoId,
      title: entry.videoTitle,
      file: entry.videoFile,
      thumbnail: entry.thumbnail,
      duration: entry.duration
    };
    
    const channel = {
      name: entry.channelName,
      folder: entry.channelFolder
    };
    
    setSelectedVideo({ ...video, channelName: channel.name, channelFolder: channel.folder });
    setView('player');
  };

  const handleDeleteVideo = async () => {
    await fetch(
      `${API_URL}/video/${selectedVideo.channelFolder}/${selectedVideo.id}`,
      { method: 'DELETE' }
    );

    addToDeleted(selectedVideo, {
      name: selectedVideo.channelName,
    });

    fetchChannels();
    setView('home');
  };

  const handleChannelClick = (channel) => {
    setSelectedChannel(channel);
    setView('channel');
  };

  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-zinc-950' : 'bg-gray-50';
  const bgSecondary = isDark ? 'bg-zinc-900' : 'bg-white';
  const border = isDark ? 'border-zinc-800' : 'border-gray-200';
  const text = isDark ? 'text-zinc-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const hover = isDark ? 'hover:bg-zinc-800' : 'hover:bg-gray-100';

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

        <SidebarButton 
          icon={Home} 
          label="Home" 
          active={view === 'home'} 
          onClick={() => setView('home')} 
        />
        <SidebarButton 
          icon={Video} 
          label="Channels" 
          active={view === 'channels'} 
          onClick={() => setView('channels')} 
        />
        <SidebarButton 
          icon={Clock} 
          label="History" 
          active={view === 'history'} 
          onClick={() => setView('history')} 
        />
        <SidebarButton 
          icon={Trash2} 
          label="Deleted" 
          active={view === 'deleted'} 
          onClick={() => setView('deleted')} 
        />

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
              className={`flex items-center gap-3 px-4 py-2 rounded-lg ${hover} ${textSecondary} w-full text-left`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {view !== 'player' && (
          <div className={`${bgSecondary} p-4 rounded-xl border ${border} flex items-center gap-3`}>
            <Search className={`${textSecondary}`} />
            <input
              placeholder="Search videos or channels..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent outline-none ${text}`}
            />
          </div>
        )}

        {view === 'home' && (
          <HomeView 
            channels={channels}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            gridView={gridView}
            setGridView={setGridView}
            playVideo={playVideo}
            watchHistory={watchHistory}
            fetchChannels={fetchChannels}
            theme={theme}
          />
        )}
        
        {view === 'channels' && (
          <ChannelsView 
            channels={channels}
            loading={loading}
            searchQuery={searchQuery}
            gridView={gridView}
            setGridView={setGridView}
            onChannelClick={handleChannelClick}
            theme={theme}
          />
        )}
        
        {view === 'channel' && (
          <ChannelView 
            channel={selectedChannel}
            searchQuery={searchQuery}
            gridView={gridView}
            setGridView={setGridView}
            onBack={() => setView('channels')}
            playVideo={playVideo}
            theme={theme}
          />
        )}
        
        {view === 'player' && (
          <PlayerView 
            video={selectedVideo}
            onBack={() => setView('home')}
            onDelete={handleDeleteVideo}
            theme={theme}
          />
        )}
        
        {view === 'history' && (
          <HistoryView 
            watchHistory={watchHistory}
            searchQuery={searchQuery}
            gridView={gridView}
            setGridView={setGridView}
            onPlayFromHistory={playFromHistory}
            theme={theme}
          />
        )}
        
        {view === 'deleted' && (
          <DeletedLogsView 
            deletedVideos={deletedVideos}
            searchQuery={searchQuery}
            onOpenYouTube={openOnYouTube}
            theme={theme}
          />
        )}
        
        {view === 'category' && (
          <CategoryView 
            category={selectedCategory}
            channels={channels}
            gridView={gridView}
            setGridView={setGridView}
            onBack={() => setView('home')}
            onEdit={() => {
              setEditingCategory(selectedCategory);
              setShowCategoryModal(true);
            }}
            onChannelClick={handleChannelClick}
            playVideo={playVideo}
            theme={theme}
          />
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal 
          categories={categories}
          channels={channels}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          onAddCategory={addCategory}
          onUpdateCategory={updateCategory}
          onDeleteCategory={deleteCategory}
          editingCategory={editingCategory}
          setEditingCategory={setEditingCategory}
          theme={theme}
        />
      )}
    </div>
  );
};

export default App;
