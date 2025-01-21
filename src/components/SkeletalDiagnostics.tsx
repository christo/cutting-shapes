import { Box, Chip, Grid2, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { Pose } from '../mocap/Pose.ts';
import { PoseSystem } from '../mocap/PoseSystem.ts';
import { Rot } from '../mocap/SkeletalRotation.ts';

function Pyr({part, rot}: {part: string, rot: Rot}) {
  const panelSx = {textAlign: 'end', flexGrow: 1, backgroundColor: 'rgba(255, 80, 80, 0.1)', p: 1.2, maxWidth: '6rem'};
  const stat = (val: number, label: string) => (
    <><Grid2 size={6} sx={{textAlign: 'end'}}>{deg(val)}°</Grid2>
      <Grid2 size={6} sx={{textAlign: 'end'}}>
        <Chip color="error" label={label} size="small" variant='outlined'/>
      </Grid2>
    </>
  );
  return <Grid2 container spacing={0.2} sx={panelSx}>
    <Grid2 size={12} sx={{alignContent: 'end'}}>{part}</Grid2>
    {stat(rot.pitch, "P")}
    {stat(rot.yaw, "Y")}
    {stat(rot.roll, "R")}
  </Grid2>
}
const deg = (rad: number) => {
  return (rad * 180 / Math.PI).toFixed(0);
}
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
          return <Box sx={{display: 'flex', flexFlow: 'row wrap', gap: 1}} key={`sd_${pi}`}>
            <Pyr part="HEAD" rot={p.skeletalRotation.head} />
            <Pyr part="NECK" rot={p.skeletalRotation.neck} />
            <Pyr part="SPINE" rot={p.skeletalRotation.spine} />
            <Pyr part="ARM L" rot={p.skeletalRotation.leftArm} />
            <Pyr part="ARM R" rot={p.skeletalRotation.rightArm} />
          </Box>
        })}
      </Stack>
    </Box>
  );
}

export { SkeletalDiagnostics };
