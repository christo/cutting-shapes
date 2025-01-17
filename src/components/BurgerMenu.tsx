import {Settings} from "@mui/icons-material";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormGroup, IconButton,
  InputLabel, MenuItem,
  Select,
  SelectChangeEvent, SwipeableDrawer,
  Switch
} from "@mui/material";
import {slide as Menu} from 'react-burger-menu';
import './BurgerMenu.css';
import {Link} from 'react-router-dom';
import {Bg, BgValues, Config} from "../Config";
import {useEffect, useState} from "react";

interface BurgerMenuProps {
  config: Config;
  setConfig: (config: Config) => void; // TODO change type to react usestate setter
}

// TODO convert to MUI sidebar panel thingy


const BurgerMenu = ({setConfig, config}: BurgerMenuProps) => {

  const debugCheckbox = <Switch checked={config.debug}
                                 onChange={event => setConfig({...config, debug: event.target.checked})}
                                 inputProps={{'aria-label': 'controlled'}}/>;
  const perfCheckbox = <Switch checked={config.perf}
                                 onChange={event => setConfig({...config, perf: event.target.checked})}
                                 inputProps={{'aria-label': 'controlled'}}/>;
  const cameraCheckbox = <Switch checked={config.camera}
                                 onChange={event => setConfig({...config, camera: event.target.checked})}
                                 inputProps={{'aria-label': 'controlled'}}/>;

  return <FormGroup>
    <Menu>
      <Link className="menu-item" to="/">
        Home
      </Link>
      <Link className="menu-item" to="/about">
        About
      </Link>
      <Link className="menu-item" to="/contact">
        Contact
      </Link>
      <div>
        <FormControlLabel control={debugCheckbox} label="Debug"/>
      </div>
      <Box>
        <FormControlLabel control={perfCheckbox} label="Performance"/>
      </Box>
      <Box>
        <FormControl sx={{m: 0, minWidth: 120}} size="small">
          <InputLabel id={`Background-select-label`} shrink>Background</InputLabel>
          <Select
              labelId={`Background-select-label`}
              id={`Background-select`}
              value={config.bg}
              variant="outlined"
              label="Background"
              autoWidth
              onChange={(event: SelectChangeEvent) => setConfig({...config, bg: (event.target.value as Bg)})}
          >
            {BgValues.map(v => <MenuItem key={`bgso_${v}`} value={v}>{v}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Box>
        <FormControlLabel control={cameraCheckbox} label="Camera"/>
        <Box>TODO: record / playback / live</Box>
      </Box>
    </Menu>
  </FormGroup>
};

export default BurgerMenu;
