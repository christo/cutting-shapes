import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ENDPOINTS } from '../Api.ts';
import { VideoSource } from '../components/VideoCamera.tsx';
import { keyToAction } from './Shortcuts.ts';
import { Action, enabled, INITIAL_MODE, isFile, transition } from './Transport.ts';

const EDITABLE_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

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
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // camera is kept open while playing files so returning to live is fast
  useEffect(() => {
    if (mode !== 'starting') {
      return;
    }
    if (stream?.active) {
      dispatch('cameraReady');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((s) => {
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
        case 'record':
          // TODO: phase 4 recording; until then don't enter recording mode
          return;
        case 'play':
          video?.play();
          break;
        case 'pause':
          video?.pause();
          break;
        case 'stop':
          if (isFile(mode) && video) {
            video.pause();
            video.currentTime = 0;
          }
          break;
      }
      dispatch(action);
    },
    [mode],
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
    source,
    videoRef,
    act,
    browsing,
    closeBrowser: () => setBrowsing(false),
    selectFile,
    onVideoError,
  };
}
