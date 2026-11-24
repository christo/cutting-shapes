import express, { type Router } from 'express';
import { createWriteStream, mkdirSync } from 'node:fs';
import { link, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { HTTP_STATUS, PARAM_RECORDING_START } from '../src/Api.ts';

export const MAX_UPLOAD_BYTES = 64 * 1024 ** 3;

const EXT = '.webm';
const PART_SUFFIX = '.part';
const REMUX_SUFFIX = `.remux${EXT}`;
const NAME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.webm$/;

/**
 * Filename from recording start time in server local time, e.g. 2026-11-24T14-03-22.webm
 */
export function recordingName(startMs: number): string {
  const d = new Date(startMs);
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
  return `${date}T${time}${EXT}`;
}

export function isRecordingName(name: string): boolean {
  return NAME_PATTERN.test(name);
}

/**
 * Rewrites container without re-encoding so browser-recorded webm gets a seek index and duration.
 */
async function remux(src: string, dest: string): Promise<void> {
  const proc = Bun.spawn(['ffmpeg', '-loglevel', 'error', '-n', '-i', src, '-c', 'copy', dest], { stderr: 'pipe' });
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`ffmpeg exit ${code}: ${await new Response(proc.stderr).text()}`);
  }
}

/**
 * Routes for listing, serving and uploading recordings in the given directory, created if absent.
 */
export function recordingsRouter(recordingsDir: string): Router {
  const dir = path.resolve(recordingsDir);
  mkdirSync(dir, { recursive: true });
  const router = express.Router();

  // newest first
  router.get('/', async (_req, res) => {
    try {
      const names = (await readdir(dir)).filter(isRecordingName).sort().reverse();
      res.json(names);
    } catch (e) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: String(e) });
    }
  });

  // sendFile supports range requests, needed for seeking
  router.get('/:name', (req, res) => {
    const { name } = req.params;
    if (!isRecordingName(name)) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND);
      return;
    }
    res.sendFile(name, { root: dir }, (err) => {
      if (err && !res.headersSent) {
        res.sendStatus(HTTP_STATUS.NOT_FOUND);
      }
    });
  });

  router.post('/', async (req, res) => {
    const startMs = Number(req.query[PARAM_RECORDING_START]);
    if (!Number.isFinite(startMs)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ error: `missing or invalid ${PARAM_RECORDING_START}` });
      return;
    }
    const length = Number(req.headers['content-length']);
    if (!Number.isFinite(length)) {
      res.sendStatus(HTTP_STATUS.LENGTH_REQUIRED);
      return;
    }
    if (length > MAX_UPLOAD_BYTES) {
      res.sendStatus(HTTP_STATUS.PAYLOAD_TOO_LARGE);
      return;
    }
    const name = recordingName(startMs);
    const finalPath = path.join(dir, name);
    if (await Bun.file(finalPath).exists()) {
      res.status(HTTP_STATUS.CONFLICT).json({ error: `${name} exists` });
      return;
    }
    // temp files never match NAME_PATTERN so unfinished uploads are not listed
    const partPath = finalPath + PART_SUFFIX;
    const remuxPath = finalPath + REMUX_SUFFIX;
    let error: unknown = null;
    try {
      await pipeline(req, createWriteStream(partPath));
      await remux(partPath, remuxPath);
      // link fails if finalPath exists, never overwrites
      await link(remuxPath, finalPath);
    } catch (e) {
      error = e;
    }
    // clean up before responding so the client never sees temp files
    await rm(partPath, { force: true });
    await rm(remuxPath, { force: true });
    if (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: String(error) });
    } else {
      res.status(HTTP_STATUS.CREATED).json({ name });
    }
  });

  return router;
}
