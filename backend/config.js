import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  // Your YouTube download directory from daily.sh
  VIDEOS_DIR: join(homedir(), 'Dump', 'Media', 'youtube'),
  
  // Server configuration
  PORT: 3001,
  
  // File extensions to scan
  VIDEO_EXTENSIONS: ['.webm', '.mp4', '.mkv', '.avi'],
  SUBTITLE_EXTENSIONS: ['.vtt', '.srt'],
  THUMBNAIL_EXTENSIONS: ['.jpg', '.png', '.webp'],
  
  // Excluded directories
  EXCLUDED_DIRS: ['.channel_assets', 'node_modules', '.git']
};