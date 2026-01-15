from pathlib import Path

# Base youtube directory
YOUTUBE_ROOT = Path(__file__).resolve().parents[2]

# .channel_assets
ASSETS_DIR = YOUTUBE_ROOT / ".channel_assets"

# localtube root
LOCALTUBE_DIR = ASSETS_DIR / "localtube"

# Channels (filesystem = truth)
CHANNELS_ROOT = YOUTUBE_ROOT

# Images
CHANNEL_PROFILES = ASSETS_DIR / "images" / "channel_profiles"
THUMBNAILS_ROOT = ASSETS_DIR / "images" / "thumbnails" / "youtube"

# Database
DB_DIR = LOCALTUBE_DIR / "db"
DB_FILE = DB_DIR / "localtube.db"

# Runtime data
HISTORY_DIR = LOCALTUBE_DIR / "history"
CACHE_DIR = LOCALTUBE_DIR / "cache"

# Rules
IGNORED_DIRS = {".channel_assets", "__pycache__"}
VIDEO_EXTENSIONS = {".mp4", ".mkv", ".webm"}
SUBTITLE_EXTENSIONS = {".vtt"}
