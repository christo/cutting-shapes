import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ENDPOINTS } from '../Api.ts';
import { VideoSource } from '../components/VideoCamera.tsx';
import { pickMimeType, uploadRecording, VIDEO_BITS_PER_SECOND } from './Recording.ts';
import { keyToAction } from './Shortcuts.ts';
import { Action, enabled, INITIAL_MODE, isFile, transition } from './Transport.ts';

const EDITABLE_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

// chunks recorded data periodically rather than once at stop
const RECORDER_TIMESLICE_MS = 1000;

function isEditable(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (EDITABLE_TAGS.includes(target.tagName) || target.isContentEditable);
}

/**
 * Owns transport mode, camera stream and selected recording; applies actions to the video element.
 */
export function useTransport() {
  const [mode, dispatch] = useReducer(transition, INITIAL_MODE);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [browsing, setBrowsing] = useState(false);
  const [recordingStartMs, setRecordingStartMs] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  // camera is kept open while playing files so returning to live is fast
  useEffect(() => {
    if (mode !== 'starting') {
      return;
    }
    if (stream?.active) {
      dispatch('cameraReady');
      return;
    }
    // separate request in parallel so camera works without mic and mic is ready by first record
    if (!micRef.current) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((m) => (micRef.current = m))
        .catch((err) => console.warn('no mic, recording without audio: ', err));
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((s) => {
        s.getVideoTracks().forEach((t) =>
          t.addEventListener('ended', () => {
            console.error('camera lost');
            recorderRef.current?.stop();
            dispatch('cameraFailed');
          }),
        );
        setStream(s);
        dispatch('cameraReady');
      })
      .catch((err) => {
        console.error('webcam error: ', err);
        dispatch('cameraFailed');
      });
  }, [mode, stream]);

  const act = useCallback(
    (action: Action) => {
      if (!enabled(mode, action)) {
        return;
      }
      const video = videoRef.current;
      switch (action) {
        case 'live':
          setFileUrl(null);
          break;
        case 'browse':
          setBrowsing(true);
          break;
        case 'record': {
          const mimeType = pickMimeType((t) => MediaRecorder.isTypeSupported(t));
          if (!stream || !mimeType) {
            console.error('cannot record: ', stream ? 'no supported format' : 'no camera');
            return;
          }
          const audioTracks = micRef.current?.getAudioTracks() ?? [];
          if (audioTracks.length === 0) {
            console.warn('recording without audio');
          }
          const tracks = [...stream.getVideoTracks(), ...audioTracks];
          const recorder = new MediaRecorder(new MediaStream(tracks), {
            mimeType,
            videoBitsPerSecond: VIDEO_BITS_PER_SECOND,
          });
          const chunks: Blob[] = [];
          const startMs = Date.now();
          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.onstop = () => {
            recorderRef.current = null;
            setRecordingStartMs(null);
            uploadRecording(new Blob(chunks, { type: mimeType }), startMs)
              .then((name) => {
                console.log('saved recording ', name);
                dispatch('saved');
              })
              .catch((err) => {
                console.error(err);
                dispatch('saveFailed');
              })
              .finally(() => {
                if (!stream.active) {
                  dispatch('cameraFailed');
                }
              });
          };
          recorder.start(RECORDER_TIMESLICE_MS);
          recorderRef.current = recorder;
          setRecordingStartMs(startMs);
          break;
        }
        case 'play':
          video?.play();
          break;
        case 'pause':
          video?.pause();
          break;
        case 'stop':
          recorderRef.current?.stop();
          if (isFile(mode) && video) {
            video.pause();
            video.currentTime = 0;
          }
          break;
      }
      dispatch(action);
    },
    [mode, stream],
  );

  const selectFile = useCallback(
    (name: string) => {
      setBrowsing(false);
      if (enabled(mode, 'fileSelected')) {
        setFileUrl(`${ENDPOINTS.RECORDINGS}/${encodeURIComponent(name)}`);
        dispatch('fileSelected');
      }
    },
    [mode],
  );

  const onVideoError = useCallback(() => {
    if (isFile(mode)) {
      console.error('recording failed to load: ', fileUrl);
      setFileUrl(null);
      dispatch('fileFailed');
    }
  }, [mode, fileUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditable(e.target)) {
        return;
      }
      const action = keyToAction(e.key, mode, e.ctrlKey || e.metaKey || e.altKey);
      if (action && enabled(mode, action)) {
        e.preventDefault();
        act(action);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, act]);

  const source: VideoSource = fileUrl ?? stream;
  return {
    mode,
    recordingStartMs,
    source,
    videoRef,
    act,
    browsing,
    closeBrowser: () => setBrowsing(false),
    selectFile,
    onVideoError,
  };
}
