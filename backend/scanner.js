import fs from 'fs';
import path from 'path';
import config from './config.js';

class VideoScanner {
  constructor() {
    this.channels = [];
  }

  isVideoFile(filename) {
    return config.VIDEO_EXTENSIONS.includes(
      path.extname(filename).toLowerCase()
    );
  }

  getVideoInfo(videoPath) {
    const infoPath = videoPath.replace(path.extname(videoPath), '.info.json');

    try {
      if (fs.existsSync(infoPath)) {
        const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
        return {
          title: info.title || path.basename(videoPath),
          uploadDate: info.upload_date
            ? this.formatDate(info.upload_date)
            : 'Unknown',
          duration: info.duration
            ? this.formatDuration(info.duration)
            : 'Unknown',
          description: info.description || '',
          viewCount: info.view_count || 0
        };
      }
    } catch {}

    return {
      title: path.basename(videoPath, path.extname(videoPath)).replace(/_/g, ' '),
      uploadDate: 'Unknown',
      duration: 'Unknown',
      description: '',
      viewCount: 0
    };
  }

  formatDate(d) {
    if (!d || d.length !== 8) return 'Unknown';
    return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
  }

  formatDuration(sec) {
    if (!sec) return 'Unknown';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return h ? `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}` : `${m}:${s.toString().padStart(2,'0')}`;
  }

  findRelatedFiles(videoPath) {
    const base = path.basename(videoPath, path.extname(videoPath));
    const dir = path.dirname(videoPath);
    const files = fs.readdirSync(dir);

    let subtitle = null;
    let thumbnail = null;

    for (const ext of config.SUBTITLE_EXTENSIONS) {
      const f = `${base}.en${ext}`;
      if (files.includes(f)) subtitle = f;
    }

    for (const ext of config.THUMBNAIL_EXTENSIONS) {
      const f = `${base}${ext}`;
      if (files.includes(f)) thumbnail = f;
    }

    return { subtitle, thumbnail };
  }

  findChannelAvatar(channelPath) {
    try {
      const files = fs.readdirSync(channelPath);
      const folder = path.basename(channelPath).toLowerCase();

      return files.find(f =>
        config.THUMBNAIL_EXTENSIONS.includes(path.extname(f).toLowerCase()) &&
        f.toLowerCase().includes(folder)
      ) || null;
    } catch {
      return null;
    }
  }

  scanChannel(channelPath) {
    const channelName = path.basename(channelPath);
    const files = fs.readdirSync(channelPath);
    const videos = [];

    for (const file of files) {
      const full = path.join(channelPath, file);
      if (fs.statSync(full).isFile() && this.isVideoFile(file)) {
        const info = this.getVideoInfo(full);
        const { subtitle, thumbnail } = this.findRelatedFiles(full);

        videos.push({
          id: path.basename(file, path.extname(file)),
          title: info.title,
          file,
          subtitle,
          thumbnail,
          uploadDate: info.uploadDate,
          duration: info.duration,
          description: info.description,
          viewCount: info.viewCount
        });
      }
    }

    return {
      id: channelName.toLowerCase().replace(/\s+/g, '_'),
      name: channelName.replace(/_/g, ' '),
      folder: channelName,
      avatar: this.findChannelAvatar(channelPath),
      videos: videos.sort((a, b) => b.uploadDate.localeCompare(a.uploadDate))
    };
  }

  async scanAll() {
    this.channels = [];

    if (!fs.existsSync(config.VIDEOS_DIR)) return this.channels;

    for (const item of fs.readdirSync(config.VIDEOS_DIR)) {
      if (config.EXCLUDED_DIRS.includes(item)) continue;

      const full = path.join(config.VIDEOS_DIR, item);
      if (fs.statSync(full).isDirectory()) {
        const ch = this.scanChannel(full);
        if (ch.videos.length) this.channels.push(ch);
      }
    }

    return this.channels;
  }

  getChannels() {
    return this.channels;
  }

  getTotalVideos() {
    return this.channels.reduce((t, c) => t + c.videos.length, 0);
  }
}

export default VideoScanner;
