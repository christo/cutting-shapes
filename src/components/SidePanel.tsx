import { Circle, Settings } from '@mui/icons-material';
import {
  Box, Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  SwipeableDrawer,
  Switch, Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bg, BgValues, Config } from '../Config';
import { StateSetter } from '../StateSetter.ts';
import { Titles } from './Titles.tsx';

interface CommonProps {
  config: Config;
  setConfig: StateSetter<Config>;
}

const SettingsPanel = ({ setConfig, config }: CommonProps) => {

  const debugCheckbox = <Switch checked={config.debug}
                                onChange={event => setConfig({ ...config, debug: event.target.checked })}
                                inputProps={{ 'aria-label': 'controlled' }} />;
  const perfCheckbox = <Switch checked={config.diag}
                               onChange={event => setConfig({ ...config, diag: event.target.checked })}
                               inputProps={{ 'aria-label': 'controlled' }} />;
  const cameraCheckbox = <Switch checked={config.camera}
                                 onChange={event => setConfig({ ...config, camera: event.target.checked })}
                                 inputProps={{ 'aria-label': 'controlled' }} />;
  const smoothingCheckbox = <Switch checked={config.smoothing}
                                 onChange={event => setConfig({ ...config, smoothing: event.target.checked })}
                                 inputProps={{ 'aria-label': 'controlled' }} />;
  const groundCheckbox = <Switch checked={config.ground}
                                 onChange={event => setConfig({ ...config, ground: event.target.checked })}
                                 inputProps={{ 'aria-label': 'controlled' }} />;

  // TODO use video file sources
  const gotRecording = false;
  if (!gotRecording && !config.live) {
    console.log("Not configured for live but no recording available, resetting to live.");
    setConfig({ ...config, live: true });
  }
  return <Stack sx={{ p: 2 }}>
    <Titles titleFontSize={30} authorFontSize={12}/>

    <Stack sx={{mt: 1, mb: 1}}>
      <Link className="menu-item" to="/">
        Home
      </Link>
      <Link className="menu-item" to="/about">
        Credits
      </Link>
      <Link className="menu-item" to="/contact">
        Contact
      </Link>
    </Stack>
    <Box sx={{mb: 1}}>
      <FormControl sx={{ mt: 2, minWidth: 120 }} size="small">
        <InputLabel id={`Background-select-label`} shrink>Background</InputLabel>
        <Select
          labelId={`Background-select-label`}
          id={`Background-select`}
          value={config.bg}
          variant="outlined"
          label="Background"
          autoWidth
          onChange={(event: SelectChangeEvent) => setConfig({ ...config, bg: (event.target.value as Bg) })}
        >
          {BgValues.map(v => <MenuItem key={`bgso_${v}`} value={v}>{v}</MenuItem>)}
        </Select>
      </FormControl>
    </Box>
    <FormControlLabel control={debugCheckbox} label="Debug" />
    <FormControlLabel control={perfCheckbox} label="Diagnostics" />
    <FormControlLabel control={cameraCheckbox} label="Camera" />
    <FormControlLabel control={groundCheckbox} label="Show Ground" />
    {/* TODO slider for how much smoothing */}
    <FormControlLabel control={smoothingCheckbox} label="Motion Smoothing" />
    {/* TODO record, stop modal control */}
    <Button sx={{m: 2}} variant="contained" color="error" startIcon={<Circle />}>
      Record
    </Button>
    <Stack direction="row" spacing={2} sx={{display: "flex", alignItems: 'center'}}>
      <Typography sx={{opacity: !gotRecording ? 0.5 : 1.0 }}>Playback</Typography>
      <Switch checked={config.live} disabled={!gotRecording}
              onChange={event => setConfig({ ...config, live: event.target.checked })}
              inputProps={{ 'aria-label': 'controlled' }} />
      <Typography >Live</Typography>

    </Stack>
  </Stack>;
};

/**
 * Hideable sliding drawer with nav and settings panel.
 * Maintains drawer state, handles toggle keyboard shortcut.
 * @param setConfig updates the config
 * @param config    current config
 */
export const SidePanel = ({ setConfig, config }: CommonProps) => {
  // ESC toggles drawer
  useEffect(() => {
    let handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault(); // eat the key
        setDrawerOpen((o: boolean) => !o);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setDrawerOpen(newOpen);
  };
  return <Box sx={{ position: 'absolute', top: 0, left: 0, p: 0, m: 2, zIndex: 200 }}>
    <IconButton aria-label="settings" size="large" onClick={toggleDrawer(true)}>
      <Settings fontSize="inherit" sx={{ opacity: 0.2 }} />
    </IconButton>
    <SwipeableDrawer
      sx={{ opacity: 0.9, m: 0 }}
      open={drawerOpen}
      onClose={toggleDrawer(false)}
      onOpen={toggleDrawer(false)}>
      <SettingsPanel config={config} setConfig={setConfig} />
    </SwipeableDrawer>
  </Box>;
};

export default SettingsPanel;
