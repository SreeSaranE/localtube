# LocalTube - Your Personal Video Library

A beautiful, self-hosted YouTube alternative for your downloaded videos.

## 🎯 What's New

✅ **All videos display on home page** - No limits, all your videos in one place  
✅ **Category channel selection** - Easy checkbox UI for adding channels to categories  
✅ **Modular component structure** - Clean, maintainable code split into components  
✅ **No history tracking** - Simplified, privacy-focused design with delete functionality  

## 🚀 Quick Setup

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```

The backend will run on `http://0.0.0.0:3001`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000` (accessible on your network)

### 3. Configuration

**For Development (Same Machine):**
- No configuration needed! The Vite proxy handles everything.

**For Network Access (Different Devices):**
1. Access the frontend using your computer's IP address
2. Example: `http://192.168.1.100:3000`
3. The proxy will automatically forward API requests to the backend

## 📁 File Structure

```
localtube/
├── backend/
│   ├── config.js        # Backend configuration
│   ├── server.js        # Express server (updated)
│   ├── scanner.js       # Video scanner
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── VideoCard.jsx          # Video thumbnail card
    │   │   ├── ChannelCard.jsx        # Channel card
    │   │   ├── CategoryModal.jsx      # Category management
    │   │   ├── HomeView.jsx           # Home page with ALL videos
    │   │   ├── ChannelsView.jsx       # All channels view
    │   │   ├── ChannelView.jsx        # Single channel view
    │   │   ├── PlayerView.jsx         # Video player
    │   │   ├── DeletedLogsView.jsx    # Deleted videos log
    │   │   └── CategoryView.jsx       # Category view
    │   ├── App.jsx      # Main app
    │   ├── index.jsx    # Entry point
    │   └── index.css    # Styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🎯 Features

- ✨ Beautiful, modern UI with dark/light theme
- 📺 Browse all videos on home page
- 🔍 Search functionality
- 📂 Custom categories with checkbox selection
- 🗑️ Delete videos with tracking log
- 📱 Responsive design
- 🎬 Video player with subtitles
- 🧩 Modular component architecture
- 🔒 No tracking - privacy-focused

## 🔧 Installation

### Step-by-Step

1. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Copy the new server.js file
   npm start
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   
   # Create components directory
   mkdir -p src/components
   
   # Copy all component files into src/components/:
   # - VideoCard.jsx
   # - ChannelCard.jsx
   # - CategoryModal.jsx
   # - HomeView.jsx
   # - ChannelsView.jsx
   # - ChannelView.jsx
   # - PlayerView.jsx
   # - DeletedLogsView.jsx
   # - CategoryView.jsx
   
   # Replace src/App.jsx with App-refactored.jsx
   
   npm install
   npm run dev
   ```

3. **Configure Video Directory**
   Edit `backend/config.js` to set your video directory:
   ```javascript
   VIDEOS_DIR: join(homedir(), 'your', 'path', 'to', 'videos')
   ```

## 🌐 Network Access

Find your IP address:

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Then access from any device on your network:
```
http://YOUR_IP_ADDRESS:3000
```

## 🎨 Component Overview

### Core Components

- **VideoCard** - Displays video with thumbnail, title, duration
- **ChannelCard** - Shows channel info and video count
- **CategoryModal** - Create/edit categories with channel selection
- **HomeView** - Main page showing ALL videos sorted by date
- **ChannelsView** - Grid of all channels
- **ChannelView** - Individual channel page
- **PlayerView** - Video player with delete button
- **DeletedLogsView** - Track deleted videos with YouTube search
- **CategoryView** - View channels and videos by category

### Main App

- **App.jsx** - Manages state and routing between views
- Clean, modular architecture
- Easy to extend and maintain

## 🗑️ Delete Feature

When you delete a video:
1. ✅ Video files are permanently removed from disk
2. ✅ Entry is added to "Deleted" log
3. ✅ "Find on YouTube" button to search for it online
4. ✅ No tracking of watch history

## 🔧 Troubleshooting

### Connection Error

1. **Backend not running:**
   ```bash
   cd backend && npm start
   ```

2. **Check backend health:**
   Open `http://localhost:3001/api/health`
   Should return: `{"status":"ok"}`

3. **Firewall issues:**
   - Allow ports 3000 and 3001
   - Check that devices are on same network

### Videos Not Loading

1. Verify `VIDEOS_DIR` path in `backend/config.js`
2. Check video file structure (videos in channel folders)
3. Review backend console for errors

### Categories Not Working

1. Use the new CategoryModal with checkboxes
2. Data stored in browser localStorage
3. Clear localStorage if having issues: `localStorage.clear()`

## 📝 Video Organization

Expected structure:
```
videos/
├── Channel Name/
│   ├── video1.mp4
│   ├── video1.jpg (thumbnail)
│   ├── video1.en.vtt (subtitle)
│   ├── video1.info.json (metadata)
│   ├── video2.webm
│   └── channel_avatar.jpg
└── Another Channel/
    └── ...
```

Supported formats:
- **Videos:** .webm, .mp4, .mkv, .avi
- **Subtitles:** .vtt, .srt
- **Thumbnails:** .jpg, .png, .webp

## 🎯 What Changed from Previous Version

### Removed
- ❌ Watch History page
- ❌ History tracking in backend
- ❌ History API endpoints
- ❌ HistoryView component

### Improved
- ✅ Simpler, privacy-focused design
- ✅ No unnecessary data collection
- ✅ Cleaner codebase
- ✅ Better performance (less data to manage)
- ✅ Delete functionality with logging

## 📄 License

MIT

---

**Enjoy your private video library! 🎬**
