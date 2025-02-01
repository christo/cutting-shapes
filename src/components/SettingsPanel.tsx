import { Circle } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Bg, BgValues, Config } from '../Config.ts';
import { StateSetter } from '../StateSetter.ts';
import { Titles } from './Titles.tsx';

export interface CommonProps {
  config: Config;
  setConfig: StateSetter<Config>;
}

const showRec = 'foo'.length < 1;
const SmoothingControl = ({ setConfig, config }: CommonProps) => {
  const marks = [
    {
      value: 0,
      label: '0',
    },
    {
      value: 0.5,
      label: '0.5',
    },
    {
      value: Config.MAX_SMOOTHING,
      label: 'MAX',
    },
  ];

  let handleChange = (_event: Event, newValue: number | number[]) => {
    setConfig({
      ...config,
      smoothing: Math.max(0, Math.min(newValue as number, Config.MAX_SMOOTHING)),
    });
  };

  function valuetext(value: number) {
    return value === Config.MAX_SMOOTHING ? 'Max' : `${(value * 100).toFixed(0)}%`;
  }

  return <FormControl sx={{ m: 2, minWidth: 120 }} size="medium">
    <Typography>Motion Smoothing</Typography>
    <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 1, mt: 1 }}>
      <Slider aria-label="Smoothing"
              defaultValue={config.smoothing}
              value={config.smoothing}
              onChange={handleChange}
              marks={marks}
              min={0}
              max={Config.MAX_SMOOTHING}
              step={0.001}
              valueLabelDisplay="auto"
              getAriaValueText={valuetext}
      />
    </Stack>
  </FormControl>;
};

function RecControls({ setConfig, config, gotRecording }: CommonProps & { gotRecording: boolean }) {
  return <><Button sx={{ m: 2 }} variant="contained" color="error" startIcon={<Circle />}>
    Record
  </Button>
    <Stack direction="row" spacing={2} sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography sx={{ opacity: !gotRecording ? 0.5 : 1.0 }}>Playback</Typography>
      <Switch checked={config.live} disabled={!gotRecording}
              onChange={event => setConfig({ ...config, live: event.target.checked })}
              inputProps={{ 'aria-label': 'controlled' }} />
      <Typography>Live</Typography>

    </Stack>
  </>;
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
  const groundCheckbox = <Switch checked={config.ground}
                                 onChange={event => setConfig({ ...config, ground: event.target.checked })}
                                 inputProps={{ 'aria-label': 'controlled' }} />;
  const ikCheckbox = <Switch checked={config.ik}
                             onChange={event => setConfig({ ...config, ik: event.target.checked })}
                             inputProps={{ 'aria-label': 'controlled' }} />;
  const meshCheckbox = <Switch checked={config.mesh}
                               onChange={event => setConfig({ ...config, mesh: event.target.checked })}
                               inputProps={{ 'aria-label': 'controlled' }} />;
  const bespokeCheckbox = <Switch checked={config.bespoke}
                                  onChange={event => setConfig({ ...config, bespoke: event.target.checked })}
                                  inputProps={{ 'aria-label': 'controlled' }} />;

  // TODO use video file sources
  const gotRecording = false;
  if (!gotRecording && !config.live) {
    console.log('Not configured for live but no recording available, resetting to live.');
    setConfig({ ...config, live: true });
  }
  return <Stack sx={{ p: 2 }}>
    <Titles titleFontSize={30} authorFontSize={18} />

    <Stack direction="row" sx={{ display: 'flex', justifyContent: 'space-around', mt: 1, mb: 1 }}>
      <Link color="warning" to="/">
        Home
      </Link>
      <Link color="warning" to="/about">
        Credits
      </Link>
    </Stack>
    <Box sx={{ mb: 1 }}>
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
    <FormControlLabel control={bespokeCheckbox} label="Bespoke Renderer" />
    <FormControlLabel control={meshCheckbox} label="Mesh Renderer" />
    <FormControlLabel control={ikCheckbox} label="Inverse Kinematics" />
    <FormControlLabel control={groundCheckbox} label="Show Ground" />
    <SmoothingControl config={config} setConfig={setConfig} />
    {showRec && <RecControls config={config} setConfig={setConfig} gotRecording={gotRecording} />}
  </Stack>;
};
export default SettingsPanel;