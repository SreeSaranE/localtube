import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';
import config from './config.js';
import VideoScanner from './scanner.js';

const app = express();
const scanner = new VideoScanner();

app.use(cors());
app.use(express.json());

await scanner.scanAll();

chokidar.watch(config.VIDEOS_DIR, { ignoreInitial: true })
  .on('add', () => scanner.scanAll())
  .on('unlink', () => scanner.scanAll());

app.get('/api/channels', (req, res) => {
  res.json(scanner.getChannels());
});

app.get('/api/video/:channel/:file', (req, res) => {
  const p = path.join(config.VIDEOS_DIR, req.params.channel, req.params.file);
  fs.existsSync(p) ? res.sendFile(p) : res.sendStatus(404);
});

app.get('/api/subtitle/:channel/:file', (req, res) => {
  const p = path.join(config.VIDEOS_DIR, req.params.channel, req.params.file);
  fs.existsSync(p) ? res.sendFile(p) : res.sendStatus(404);
});

app.get('/api/thumbnail/:channel/:file', (req, res) => {
  const p = path.join(config.VIDEOS_DIR, req.params.channel, req.params.file);
  fs.existsSync(p) ? res.sendFile(p) : res.sendStatus(404);
});

app.get('/api/channel-avatar/:channel/:file', (req, res) => {
  const p = path.join(config.VIDEOS_DIR, req.params.channel, req.params.file);
  fs.existsSync(p) ? res.sendFile(p) : res.sendStatus(404);
});

app.listen(config.PORT, () =>
  console.log(`LocalTube backend running on ${config.PORT}`)
);

app.delete('/api/video/:channelFolder/:videoId', async (req, res) => {
  const { channelFolder, videoId } = req.params;

  const folderPath = path.join(config.VIDEOS_DIR, channelFolder);

  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      if (file.startsWith(videoId)) {
        fs.unlinkSync(path.join(folderPath, file));
      }
    }

    await scanner.scanAll();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});
