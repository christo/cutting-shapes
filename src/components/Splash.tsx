import { Box } from '@mui/material';
import { Titles } from './Titles.tsx';

export function Splash({ showSplash }: { showSplash: boolean }) {
  return <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    justifyItems: 'center',
    p: 10, width: '50%',
    height: '50%',
    border: 'pink dotted thick',
    zIndex: 500,
    visibility: showSplash ? 'visible' : 'hidden',
  }}>
    <Titles titleFontSize={80} authorFontSize={44} />
  </Box>;
}