import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { PerfTime } from '../mocap/PerfTime.ts';
import { PoseSystem } from '../mocap/PoseSystem.ts';
import { SkeletalDiagnostics } from './SkeletalDiagnostics.tsx';

const PerfDetail = ({ perfTime }: { perfTime: PerfTime }) => {
  const formatNumber = (value: number) => {
    if (isNaN(value)) {
      return '?';
    } else {
      return value.toFixed(2);
    }
  };
  const sx = {
    fontFamily: '"Kode Mono", monospace',
    fontSize: '18px',
    fontWeight: 400,
    fontStyle: 'normal',
    color: 'rgba(255, 80, 80, 1)',
    textShadow: '0 0 5px rgba(255, 50, 50, 0.7), 0 0 8px rgba(255, 50, 50, 0.4)',
    minWidth: '19rem',
    textAlign: 'right',
  };
  // TODO format prettier with grid:
  return <>
    <Typography sx={sx}>{formatNumber(1000 / perfTime.msVisionTime)} Hz {formatNumber(perfTime.msVisionTime)} ms
      vision</Typography>
    <Typography sx={sx}>{formatNumber(1000 / perfTime.msRenderTime)} Hz {formatNumber(perfTime.msRenderTime)} ms
      render</Typography>
    <Typography sx={sx}>{formatNumber(1000 / perfTime.msTransformTime)} Hz {formatNumber(perfTime.msTransformTime)} ms
      x-form</Typography>
  </>;
};
export const PerfPanel = ({ poseSystem }: { poseSystem: PoseSystem }) => {
  const [perfTime, setPerfTime] = useState<PerfTime>(PerfTime.NULL);
  useEffect(() => {
    console.log("setup stats updater");
    let animationFrameId: number;
    const updateStats = () => {
      setPerfTime(poseSystem.calcPerfTime());
      animationFrameId = requestAnimationFrame(updateStats);
    };
    updateStats();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  const perfDetail = perfTime.ready() ? <PerfDetail perfTime={perfTime} /> :
    <CircularProgress sx={{ m: 4 }} color="error" size={60} />;

  return <Stack sx={{
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'red',
    display: 'flex', alignItems: 'end',
    padding: 3,
    gap: 1,
    margin: 0,
    // border: 'red dashed',
    position: 'absolute', right: 0, top: 0, zIndex: 500,
    minWidth: '30%',
  }}>
    <Box>
      <SkeletalDiagnostics poseSystem={poseSystem} />
    </Box>
    <Box>
      {perfDetail}
    </Box>

  </Stack>;
};