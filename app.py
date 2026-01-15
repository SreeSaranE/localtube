import sqlite3
from pathlib import Path
from flask import Flask, render_template, send_file, abort, request, redirect

from paths import (
    DB_FILE,
    DB_DIR,
    CHANNELS_ROOT,
    IGNORED_DIRS,
    VIDEO_EXTENSIONS,
    SUBTITLE_EXTENSIONS,
    THUMBNAILS_ROOT,
    CHANNEL_PROFILES
)

app = Flask(__name__)

# -----------------------
# Database helpers
# -----------------------

def get_db():
    return sqlite3.connect(DB_FILE)

def init_db():
    DB_DIR.mkdir(parents=True, exist_ok=True)

    with get_db() as conn:
        cur = conn.cursor()

        cur.execute("""
            CREATE TABLE IF NOT EXISTS channels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                path TEXT NOT NULL,
                profile_image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                channel_id INTEGER NOT NULL,
                video_path TEXT NOT NULL UNIQUE,
                thumbnail_path TEXT,
                subtitle_path TEXT,
                youtube_url TEXT,
                deleted INTEGER DEFAULT 0,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(channel_id) REFERENCES channels(id)
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id INTEGER,
                action TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()

# -----------------------
# Scanning logic
# -----------------------

def scan_channels():
    with get_db() as conn:
        cur = conn.cursor()

        for entry in CHANNELS_ROOT.iterdir():
            if not entry.is_dir():
                continue
            if entry.name in IGNORED_DIRS:
                continue

            cur.execute(
                "INSERT OR IGNORE INTO channels (name, path) VALUES (?, ?)",
                (entry.name, str(entry.resolve()))
            )

        conn.commit()

def find_subtitle(video_path: Path):
    base = video_path.stem
    for f in video_path.parent.iterdir():
        if not f.is_file():
            continue
        if f.suffix.lower() not in SUBTITLE_EXTENSIONS:
            continue
        if f.stem.startswith(base):
            return str(f.resolve())
    return None

def find_thumbnail(channel_name: str, video_path: Path):
    channel_dir = THUMBNAILS_ROOT / channel_name
    if not channel_dir.exists():
        return None

    for img in channel_dir.iterdir():
        if not img.is_file():
            continue
        if img.stem == video_path.stem:
            return str(img.resolve())

    return None

def scan_videos():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, path, name FROM channels")
        channels = cur.fetchall()

        for channel_id, channel_path, channel_name in channels:
            channel_path = Path(channel_path)

            if not channel_path.exists():
                continue

            for file in channel_path.iterdir():
                if not file.is_file():
                    continue
                if file.suffix.lower() not in VIDEO_EXTENSIONS:
                    continue

                video_path = str(file.resolve())
                title = file.stem
                subtitle = find_subtitle(file)
                thumbnail = find_thumbnail(channel_name, file)

                cur.execute(
                    """
                    INSERT OR IGNORE INTO videos
                    (title, channel_id, video_path, subtitle_path, thumbnail_path)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (title, channel_id, video_path, subtitle, thumbnail)
                )

        conn.commit()

# -----------------------
# Queries
# -----------------------

def get_all_videos():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT
                MIN(v.id) AS id,
                v.title,
                c.name,
                v.thumbnail_path
            FROM videos v
            JOIN channels c ON v.channel_id = c.id
            WHERE v.deleted = 0
            GROUP BY v.video_path
            ORDER BY MIN(v.added_at) DESC
        """)
        return cur.fetchall()

def get_channel_videos(channel_name):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT
                MIN(v.id) AS id,
                v.title,
                c.name,
                v.thumbnail_path
            FROM videos v
            JOIN channels c ON v.channel_id = c.id
            WHERE v.deleted = 0
              AND c.name = ?
            GROUP BY v.video_path
            ORDER BY MIN(v.added_at) DESC
        """, (channel_name,))
        return cur.fetchall()

def get_subscriptions():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT
                c.name,
                COUNT(v.id) as video_count
            FROM channels c
            JOIN videos v ON v.channel_id = c.id
            WHERE v.deleted = 0
            GROUP BY c.id
            HAVING video_count > 0
            ORDER BY c.name COLLATE NOCASE
        """)

        rows = cur.fetchall()

    result = []
    for name, count in rows:
        result.append(
            (name, count, get_channel_avatar(name))
        )

    return result

def get_channel_avatar(channel_name):
    avatar = Path(
        f"{THUMBNAILS_ROOT.parents[2]}/images/channel_profiles/{channel_name}.jpg"
    )
    if avatar.exists():
        return str(avatar.resolve())
    return None

def get_video(video_id):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT title, video_path, subtitle_path
            FROM videos
            WHERE id = ? AND deleted = 0
        """, (video_id,))
        return cur.fetchone()

def delete_video(video_id):
    with get_db() as conn:
        cur = conn.cursor()

        cur.execute("""
            SELECT video_path
            FROM videos
            WHERE id = ? AND deleted = 0
        """, (video_id,))
        row = cur.fetchone()

        if not row:
            return False

        video_path = Path(row[0])

        # delete video
        if video_path.exists():
            video_path.unlink()

        # delete all subtitle variants
        base = video_path.stem
        for f in video_path.parent.iterdir():
            if f.is_file() and f.suffix.lower() == ".vtt" and f.stem.startswith(base):
                f.unlink()

        # mark deleted
        cur.execute(
            "UPDATE videos SET deleted = 1 WHERE id = ?",
            (video_id,)
        )

        # history
        cur.execute(
            "INSERT INTO history (video_id, action) VALUES (?, ?)",
            (video_id, "deleted")
        )

        conn.commit()
        return True

# -----------------------
# Routes
# -----------------------

@app.route("/")
def index():
    videos = get_all_videos()
    return render_template("home.html", videos=videos, active="home")

@app.route("/player/<int:video_id>")
def player(video_id):
    video = get_video(video_id)
    if not video:
        abort(404)
    return render_template("player.html", video=video)

@app.route("/delete/<int:video_id>", methods=["POST"])
def delete(video_id):
    if not delete_video(video_id):
        abort(404)
    return redirect("/")

@app.route("/channel/<channel_name>")
def channel_page(channel_name):
    videos = get_channel_videos(channel_name)
    return render_template(
        "channel.html",
        channel=channel_name,
        videos=videos,
        active="subscriptions"
    )

@app.route("/media/video")
def serve_video():
    path = request.args.get("path")
    if not path:
        abort(404)

    path = Path(path)
    if not path.exists() or not path.is_file():
        abort(404)

    return send_file(path)

@app.route("/media/subtitle")
def serve_subtitle():
    path = request.args.get("path")
    if not path:
        abort(404)

    path = Path(path)
    if not path.exists() or not path.is_file():
        abort(404)

    return send_file(path)

@app.route("/media/thumb")
def serve_thumbnail():
    path = request.args.get("path")
    if not path:
        abort(404)

    path = Path(path)
    if not path.exists() or not path.is_file():
        abort(404)

    return send_file(path)

@app.route("/subscriptions")
def subscriptions():
    channels = get_subscriptions()
    return render_template("subscriptions.html", channels=channels, active="subscriptions")

# -----------------------
# Startup
# -----------------------

if __name__ == "__main__":
    init_db()
    scan_channels()
    scan_videos()
    app.run(host="0.0.0.0", port=5000, debug=True)
