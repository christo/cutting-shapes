import { Dialog, DialogContent, DialogTitle, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { ENDPOINTS } from '../Api.ts';

/**
 * Lists server-side recordings for playback.
 */
export function RecordingBrowser({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (name: string) => void;
}) {
  const [names, setNames] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setNames(null);
    setError(null);
    fetch(ENDPOINTS.RECORDINGS)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status} ${res.statusText}`))))
      .then(setNames)
      .catch((e) => setError(String(e)));
  }, [open]);

  let content;
  if (error) {
    content = <Typography color="error">{error}</Typography>;
  } else if (names === null) {
    content = <Typography>Loading...</Typography>;
  } else if (names.length === 0) {
    content = <Typography>No recordings</Typography>;
  } else {
    content = (
      <List>
        {names.map((name) => (
          <ListItemButton key={name} onClick={() => onSelect(name)}>
            <ListItemText primary={name} />
          </ListItemButton>
        ))}
      </List>
    );
  }
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Recordings</DialogTitle>
      <DialogContent>{content}</DialogContent>
    </Dialog>
  );
}
