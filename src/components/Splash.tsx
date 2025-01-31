import { Box } from '@mui/material';
import { Z_INDEX_SPLASH } from './Home.tsx';
import { Titles } from './Titles.tsx';

export function Splash({ visible }: { visible: boolean }) {
  return <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    justifyItems: 'center',
    p: 10, width: '50%',
    height: '50%',
    border: 'pink dotted thick',
    zIndex: Z_INDEX_SPLASH,
    visibility: visible ? 'visible' : 'hidden',
  }}>
    <Titles titleFontSize={80} authorFontSize={44} />
  </Box>;
}