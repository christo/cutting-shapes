import { Box, Grid2, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Rot } from '../analysis/Rot.ts';
import { Pose } from '../mocap/Pose.ts';
import { PoseSystem } from '../mocap/PoseSystem.ts';
import { DATA_STYLE } from './Home.tsx';

/**
 * Show Pitch, Roll and Yaw values with the given title.
 * @param title label for these stats.
 * @param rot the 3-axis rotation values to show.
 * @constructor
 */
function Pyr({ title, rot, debug }: { title: string, rot: Rot, debug: string[] }) {
  const panelSx = {
    textAlign: 'end',
    p: 1.2,
    maxWidth: '6rem',
    fontSize: 'smaller',
    ...DATA_STYLE,
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
    <Grid2 size={12}>
      {debug.map((s: string, i: number) => <Box key={`pd_${i}`}>{s}</Box>)}
    </Grid2>
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
          // one person pose per row
          return <Stack direction="row" key={`sd_${pi}`}>
            <Box sx={{mr: 1}}>
              <Typography sx={{fontWeight: 'bold', fontSize: "3rem"}}>
                {pi + 1}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexFlow: 'row wrap', gap: 1 }} >
              <Pyr title="HEAD" rot={sr.head} debug={[]}/>
              <Pyr title="NECK" rot={sr.neck} debug={[]}/>
              <Pyr title="SPINE" rot={sr.spine} debug={sr.spine.debug} />
              {/*<Pyr title="ARM UL" rot={sr.leftArm} debug={[]}/>*/}
              {/*<Pyr title="ARM UR" rot={sr.rightArm} debug={[]}/>*/}
              {/*<Pyr title="ARM LL" rot={sr.leftForearm} debug={[]}/>*/}
              {/*<Pyr title="ARM LR" rot={sr.rightForearm} debug={[]}/>*/}
            </Box>
          </Stack>;
        })}
      </Stack>
    </Box>
  );
}

export { SkeletalDiagnostics };
