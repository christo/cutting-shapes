import { FiberManualRecord, FolderOpen, Pause, PlayArrow, Stop, Videocam } from '@mui/icons-material';
import { Box, Fade, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { ReactElement, useEffect, useState } from 'react';
import { formatElapsed } from '../transport/Recording.ts';
import { keyLabels } from '../transport/Shortcuts.ts';
import { Action, enabled, isLive, Mode } from '../transport/Transport.ts';
import { DATA_STYLE } from './Style.ts';

const RECORD_RED = 'rgb(230, 0, 0)';
const TIMER_TICK_MS = 250;
const DOT_SIZE = 16;

const BUTTONS: { action: Action; label: string; icon: ReactElement }[] = [
  { action: 'live', label: 'Live camera', icon: <Videocam /> },
  { action: 'browse', label: 'Browse recordings', icon: <FolderOpen /> },
  { action: 'record', label: 'Record', icon: <FiberManualRecord /> },
  { action: 'play', label: 'Play', icon: <PlayArrow /> },
  { action: 'pause', label: 'Pause', icon: <Pause /> },
  { action: 'stop', label: 'Stop', icon: <Stop /> },
];

function Elapsed({ startMs }: { startMs: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), TIMER_TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  return <Typography sx={{ ...DATA_STYLE, color: RECORD_RED }}>{formatElapsed(now - startMs)}</Typography>;
}

/**
 * Transport buttons; each is enabled exactly when the transport table allows its action in the current mode.
 */
export function TransportControls({
  mode,
  recordingStartMs,
  act,
  visible,
  hoverProps,
  zIndex,
}: {
  mode: Mode;
  recordingStartMs: number | null;
  act: (action: Action) => void;
  visible: boolean;
  hoverProps: { onMouseEnter: () => void; onMouseLeave: () => void };
  zIndex: number;
}) {
  const recording = mode === 'liveRecording';
  return (
    <Fade in={visible}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        {...hoverProps}
        sx={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          px: 2,
          py: 1,
          borderRadius: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex,
        }}
      >
        {BUTTONS.map(({ action, label, icon }) => {
          const keys = keyLabels(action);
          const lit = (action === 'record' && recording) || (action === 'live' && isLive(mode));
          return (
            <Tooltip key={action} title={keys ? `${label} (${keys})` : label}>
              {/* span so tooltip works on disabled buttons */}
              <span>
                <IconButton
                  size="large"
                  disabled={!enabled(mode, action)}
                  onClick={() => act(action)}
                  sx={{
                    color: action === 'record' ? RECORD_RED : 'white',
                    '&.Mui-disabled': { color: lit ? (action === 'record' ? RECORD_RED : 'white') : undefined },
                  }}
                >
                  {icon}
                </IconButton>
              </span>
            </Tooltip>
          );
        })}
        {recording && recordingStartMs !== null && <Elapsed startMs={recordingStartMs} />}
        {mode === 'saving' && <Typography sx={{ ...DATA_STYLE, color: 'white' }}>saving</Typography>}
      </Stack>
    </Fade>
  );
}

/**
 * Shown while recording with controls hidden.
 */
export function RecordingDot({ zIndex }: { zIndex: number }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: DOT_SIZE,
        bottom: DOT_SIZE,
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: '50%',
        backgroundColor: RECORD_RED,
        zIndex,
      }}
    />
  );
}
