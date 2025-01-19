import { Typography } from '@mui/material';

export function Titles({titleFontSize, authorFontSize}: {titleFontSize: number, authorFontSize: number} ) {
  return <>
    <Typography sx={{
      fontFamily: "\"Londrina Solid\", sans-serif",
      fontWeight: 900,
      fontStyle: "normal",
      textShadow: "0 0 1px rgba(20, 0, 50, 0.9), 0 0 10px rgba(215, 200, 230, 0.3)",
      textAlign: "center",
      fontSize: titleFontSize,
      color: 'secondary.main',
    }}>Cutting Shapes</Typography>
    <Typography sx={{
      fontFamily: "\"Playwrite AU QLD\", cursive", // TODO replace with fatter font like Lobster
      textAlign: "center",
      fontWeight: 400,
      fontSize: authorFontSize,
      color: 'primary.main',
      mt: 1,
      mb: 1
    }}>Chris Mountford 2025</Typography>

  </>
}
