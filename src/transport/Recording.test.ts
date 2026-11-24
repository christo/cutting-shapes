import { describe, it } from 'bun:test';
import { expect } from 'chai';
import { ENDPOINTS, HTTP_STATUS, PARAM_RECORDING_START } from '../Api.ts';
import { formatElapsed, MIME_TYPES, pickMimeType, uploadRecording, uploadUrl } from './Recording.ts';

const START_MS = 1764000000000;
const NAME = '2026-11-24T14-03-22.webm';
const MIME = 'video/webm';

describe('recording', () => {
  it('picks the first supported mime type', () => {
    expect(pickMimeType(() => true)).to.equal(MIME_TYPES[0]);
    expect(pickMimeType((t) => t === MIME)).to.equal(MIME);
    expect(pickMimeType(() => false)).to.be.null;
  });

  it('puts start time in upload url', () => {
    expect(uploadUrl(START_MS)).to.equal(`${ENDPOINTS.RECORDINGS}?${PARAM_RECORDING_START}=${START_MS}`);
  });

  it('posts blob with its type and returns saved name', async () => {
    let request: Request | null = null;
    const fakeFetch = (async (input: string, init: RequestInit) => {
      request = new Request(`http://localhost${input}`, init);
      return Response.json({ name: NAME }, { status: HTTP_STATUS.CREATED });
    }) as unknown as typeof fetch;
    const blob = new Blob(['data'], { type: MIME });
    expect(await uploadRecording(blob, START_MS, fakeFetch)).to.equal(NAME);
    expect(request!.method).to.equal('POST');
    expect(request!.headers.get('Content-Type')).to.equal(MIME);
    expect(await request!.text()).to.equal('data');
  });

  it('throws on failed upload', async () => {
    const fakeFetch = (async () => new Response('nope', { status: HTTP_STATUS.CONFLICT })) as unknown as typeof fetch;
    let error: unknown = null;
    try {
      await uploadRecording(new Blob([]), START_MS, fakeFetch);
    } catch (e) {
      error = e;
    }
    expect(String(error)).to.contain(String(HTTP_STATUS.CONFLICT));
  });

  it('formats elapsed time', () => {
    expect(formatElapsed(0)).to.equal('0:00');
    expect(formatElapsed(999)).to.equal('0:00');
    expect(formatElapsed(61_000)).to.equal('1:01');
    expect(formatElapsed(3_599_000)).to.equal('59:59');
    expect(formatElapsed(3_600_000)).to.equal('1:00:00');
    expect(formatElapsed(-5)).to.equal('0:00');
  });
});
