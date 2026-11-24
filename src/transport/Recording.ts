import { ENDPOINTS, PARAM_RECORDING_START } from '../Api.ts';

/**
 * Preferred first. Webm only: server remuxes with stream copy into .webm.
 */
export const MIME_TYPES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];

export const VIDEO_BITS_PER_SECOND = 8_000_000;

export function pickMimeType(isSupported: (mimeType: string) => boolean): string | null {
  return MIME_TYPES.find(isSupported) ?? null;
}

export function uploadUrl(startMs: number): string {
  return `${ENDPOINTS.RECORDINGS}?${PARAM_RECORDING_START}=${startMs}`;
}

/**
 * Uploads a finished recording, resolving to the saved name.
 */
export async function uploadRecording(blob: Blob, startMs: number, fetchFn: typeof fetch = fetch): Promise<string> {
  const res = await fetchFn(uploadUrl(startMs), {
    method: 'POST',
    body: blob,
    headers: { 'Content-Type': blob.type },
  });
  if (!res.ok) {
    throw new Error(`upload failed: ${res.status} ${await res.text()}`);
  }
  const { name } = await res.json();
  return name;
}

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

/**
 * Elapsed time as m:ss, or h:mm:ss from one hour.
 */
export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / MS_PER_SECOND);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  const totalMinutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}
