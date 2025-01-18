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
  Switch,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bg, BgValues, Config } from '../Config';
import { StateSetter } from '../Util.ts';

interface CommonProps {
  config: Config;
  setConfig: StateSetter<Config>;
}

const SettingsPanel = ({ setConfig, config }: CommonProps) => {

  const debugCheckbox = <Switch checked={config.debug}
                                onChange={event => setConfig({ ...config, debug: event.target.checked })}
                                inputProps={{ 'aria-label': 'controlled' }} />;
  const perfCheckbox = <Switch checked={config.perf}
                               onChange={event => setConfig({ ...config, perf: event.target.checked })}
                               inputProps={{ 'aria-label': 'controlled' }} />;
  const cameraCheckbox = <Switch checked={config.camera}
                                 onChange={event => setConfig({ ...config, camera: event.target.checked })}
                                 inputProps={{ 'aria-label': 'controlled' }} />;

  const liveOrPlayback = <Switch checked={config.live}
                                 onChange={event => setConfig({ ...config, live: event.target.checked })}
                                 inputProps={{ 'aria-label': 'controlled' }} />;

  return <Stack sx={{ p: 2 }}>
    <Link className="menu-item" to="/">
      Home
    </Link>
    <Link className="menu-item" to="/about">
      About
    </Link>
    <Link className="menu-item" to="/contact">
      Contact
    </Link>

    <FormControlLabel control={debugCheckbox} label="Debug" />
    <FormControlLabel control={perfCheckbox} label="Performance" />
    <FormControlLabel control={cameraCheckbox} label="Camera" />
    {/* TODO record, stop*/}
    <Button variant="outlined" startIcon={<Circle />}>
      Record
    </Button>
    <FormControlLabel control={liveOrPlayback} label="Live" />

    <Box>
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
