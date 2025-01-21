import { Box, Grid2, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Rot } from '../mocap/geometry/la.ts';
import { Pose } from '../mocap/Pose.ts';
import { PoseSystem } from '../mocap/PoseSystem.ts';

function Pyr({ part, rot }: { part: string, rot: Rot }) {
  const panelSx = {
    textAlign: 'end',
    backgroundColor: 'rgba(255, 80, 80, 0.05)',
    p: 1.2,
    maxWidth: '6rem',
    fontSize: 'smaller'
  };
  const stat = (val: number, label: string) => (
    <><Grid2 size={6} sx={{ textAlign: 'end' }}>{deg(val)}°</Grid2>
      <Grid2 size={6} sx={{ textAlign: 'end' }}>
        <Typography>{label}</Typography>
      </Grid2>
    </>
  );
  return <Grid2 container spacing={0.2} sx={panelSx}>
    <Grid2 size={12} sx={{ textAlign: 'end'}}>{part}</Grid2>
    {stat(rot.pitch, 'P')}
    {stat(rot.yaw, 'Y')}
    {stat(rot.roll, 'R')}
  </Grid2>;
}

const deg = (rad: number) => {
  return (rad * 180 / Math.PI).toFixed(0);
};

function SkeletalDiagnostics({ poseSystem }: { poseSystem: PoseSystem }) {
  const [poses, setPoses] = useState<Pose[]>([]);
  useEffect(() => {
    console.log('setup stats updater');
    let animationFrameId: number;
    const updateStats = () => {
      setPoses(poseSystem.subscribe());
      animationFrameId = requestAnimationFrame(updateStats);
    };
    updateStats();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <Box>
      <Stack>
        {poses.map((p: Pose, pi: number) => {
          return <Stack direction="row" key={`sd_${pi}`}>
            <Box sx={{mr: 1}}><Typography sx={{fontWeight: 'bold', fontSize: "large"}}>{pi + 1}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexFlow: 'row wrap', gap: 1 }} >
              <Pyr part="HEAD" rot={p.skeletalRotation.head} />
              <Pyr part="NECK" rot={p.skeletalRotation.neck} />
              <Pyr part="SPINE" rot={p.skeletalRotation.spine} />
              <Pyr part="ARM UL" rot={p.skeletalRotation.leftArm} />
              <Pyr part="ARM UR" rot={p.skeletalRotation.rightArm} />
              <Pyr part="ARM LL" rot={p.skeletalRotation.leftForearm} />
              <Pyr part="ARM LR" rot={p.skeletalRotation.rightForearm} />
            </Box>
          </Stack>;
        })}
      </Stack>
    </Box>
  );
}

export { SkeletalDiagnostics };
