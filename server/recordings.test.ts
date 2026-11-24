import { describe, it } from 'bun:test';
import { expect } from 'chai';
import express from 'express';
import { once } from 'node:events';
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ENDPOINTS, HTTP_STATUS, PARAM_RECORDING_START } from '../src/Api.ts';
import { isRecordingName, recordingName, recordingsRouter } from './recordings.ts';

const HAS_FFMPEG = Bun.which('ffmpeg') !== null;
const START = new Date(2026, 10, 24, 14, 3, 22);
const NAME = '2026-11-24T14-03-22.webm';
const OLDER_NAME = '2025-01-02T03-04-05.webm';

/**
 * Runs fn against a server on a random port with a fresh temp recordings dir.
 */
async function withServer(fn: (baseUrl: string, dir: string) => Promise<void>) {
  const dir = await mkdtemp(path.join(tmpdir(), 'cs-rec-'));
  const app = express();
  app.use(ENDPOINTS.RECORDINGS, recordingsRouter(dir));
  const server = app.listen(0);
  await once(server, 'listening');
  const { port } = server.address() as AddressInfo;
  try {
    await fn(`http://localhost:${port}${ENDPOINTS.RECORDINGS}`, dir);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
}

const uploadUrl = (baseUrl: string, startMs: number) => `${baseUrl}?${PARAM_RECORDING_START}=${startMs}`;

async function makeWebm(dir: string): Promise<Uint8Array> {
  const file = path.join(dir, 'fixture.webm');
  const lavfiTestPattern = 'testsrc=duration=1:size=64x64:rate=10';
  const proc = Bun.spawn([
    'ffmpeg',
    '-loglevel',
    'error',
    '-f',
    'lavfi',
    '-i',
    lavfiTestPattern,
    '-c:v',
    'libvpx',
    file,
  ]);
  expect(await proc.exited).to.equal(0);
  return new Uint8Array(await Bun.file(file).arrayBuffer());
}

describe('recording names', () => {
  it('formats start time as zero-padded local time', () => {
    expect(recordingName(START.getTime())).to.equal(NAME);
  });
  it('accepts generated names only', () => {
    expect(isRecordingName(NAME)).to.be.true;
    for (const bad of ['foo.webm', `${NAME}.part`, `../${NAME}`, `${NAME}.remux.webm`, '']) {
      expect(isRecordingName(bad), bad).to.be.false;
    }
  });
});

describe('recordings router', () => {
  it('lists only recordings, newest first', () =>
    withServer(async (baseUrl, dir) => {
      for (const f of [OLDER_NAME, NAME, `${NAME}.part`, 'notes.txt']) {
        await writeFile(path.join(dir, f), '');
      }
      const res = await fetch(baseUrl);
      expect(res.status).to.equal(HTTP_STATUS.OK);
      expect(await res.json()).to.deep.equal([NAME, OLDER_NAME]);
    }));

  it('serves a recording with range support', () =>
    withServer(async (baseUrl, dir) => {
      await writeFile(path.join(dir, NAME), 'abcdef');
      const full = await fetch(`${baseUrl}/${NAME}`);
      expect(full.status).to.equal(HTTP_STATUS.OK);
      expect(await full.text()).to.equal('abcdef');
      const partial = await fetch(`${baseUrl}/${NAME}`, { headers: { Range: 'bytes=2-3' } });
      expect(partial.status).to.equal(HTTP_STATUS.PARTIAL_CONTENT);
      expect(await partial.text()).to.equal('cd');
    }));

  it('404s on missing or non-recording names', () =>
    withServer(async (baseUrl, dir) => {
      await writeFile(path.join(dir, 'notes.txt'), 'secret');
      for (const name of [NAME, 'notes.txt', encodeURIComponent('../package.json')]) {
        const res = await fetch(`${baseUrl}/${name}`);
        expect(res.status, name).to.equal(HTTP_STATUS.NOT_FOUND);
      }
    }));

  it('rejects upload without valid start time', () =>
    withServer(async (baseUrl) => {
      const res = await fetch(baseUrl, { method: 'POST', body: new Uint8Array(1) });
      expect(res.status).to.equal(HTTP_STATUS.BAD_REQUEST);
    }));

  it('rejects upload that would overwrite', () =>
    withServer(async (baseUrl, dir) => {
      await writeFile(path.join(dir, NAME), 'original');
      const res = await fetch(uploadUrl(baseUrl, START.getTime()), { method: 'POST', body: new Uint8Array(1) });
      expect(res.status).to.equal(HTTP_STATUS.CONFLICT);
      expect(await Bun.file(path.join(dir, NAME)).text()).to.equal('original');
    }));

  it.skipIf(!HAS_FFMPEG)('saves a valid upload, leaving no temp files', () =>
    withServer(async (baseUrl, dir) => {
      const webm = await makeWebm(dir);
      const res = await fetch(uploadUrl(baseUrl, START.getTime()), { method: 'POST', body: webm });
      expect(res.status).to.equal(HTTP_STATUS.CREATED);
      expect(await res.json()).to.deep.equal({ name: NAME });
      expect((await readdir(dir)).sort()).to.deep.equal([NAME, 'fixture.webm']);
      const listed = await (await fetch(baseUrl)).json();
      expect(listed).to.deep.equal([NAME]);
    }),
  );

  it.skipIf(!HAS_FFMPEG)('fails invalid video, leaving nothing behind', () =>
    withServer(async (baseUrl, dir) => {
      const res = await fetch(uploadUrl(baseUrl, START.getTime()), { method: 'POST', body: 'not a video' });
      expect(res.status).to.equal(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(await readdir(dir)).to.deep.equal([]);
    }),
  );
});
