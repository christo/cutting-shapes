import { Box, Grid2, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Rot } from '../analysis/Rot.ts';
import { Pose } from '../mocap/Pose.ts';
import { PoseSystem } from '../mocap/PoseSystem.ts';

/**
 * Show Pitch, Roll and Yaw values with the given title.
 * @param title label for these stats.
 * @param rot the 3-axis rotation values to show.
 * @constructor
 */
function Pyr({ title, rot }: { title: string, rot: Rot }) {
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
    <Grid2 size={12} sx={{ textAlign: 'end'}}>{title}</Grid2>
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
          const sr = p.skeletalRotation;
          return <Stack direction="row" key={`sd_${pi}`}>
            <Box sx={{mr: 1}}>
              <Typography sx={{fontWeight: 'bold', fontSize: "large"}}>
                {pi + 1}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexFlow: 'row wrap', gap: 1 }} >
              <Pyr title="HEAD" rot={sr.head} />
              <Pyr title="NECK" rot={sr.neck} />
              <Pyr title="SPINE" rot={sr.spine} />
              <Pyr title="ARM UL" rot={sr.leftArm} />
              <Pyr title="ARM UR" rot={sr.rightArm} />
              <Pyr title="ARM LL" rot={sr.leftForearm} />
              <Pyr title="ARM LR" rot={sr.rightForearm} />
            </Box>
          </Stack>;
        })}
      </Stack>
    </Box>
  );
}

export { SkeletalDiagnostics };
