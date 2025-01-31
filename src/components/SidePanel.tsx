import { Settings } from '@mui/icons-material';
import { Box, IconButton, SwipeableDrawer } from '@mui/material';
import { useEffect, useState } from 'react';
import SettingsPanel, { CommonProps } from './SettingsPanel.tsx';

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


