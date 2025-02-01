import { Typography } from '@mui/material';

export function Titles({titleFontSize, authorFontSize}: {titleFontSize: number, authorFontSize: number} ) {
  return <>
    <Typography sx={{
      fontFamily: "\"Londrina Solid\", sans-serif",
      fontWeight: 900,
      fontStyle: "normal",
      textShadow: "0 0 3px rgba(20, 0, 50, 0.7), 0 0 10px rgba(15, 20, 23, 0.3)",
      textAlign: "center",
      fontSize: titleFontSize,
      color: 'secondary.main',
    }}>Cutting Shapes</Typography>
    <Typography sx={{
      fontFamily: "\"Londrina Solid\", sans-serif", // TODO replace
      textAlign: "center",
      fontWeight: 400,
      fontSize: authorFontSize,
      color: 'primary.main',
      mt: 1,
      mb: 1
    }}>Chris Mountford 2025</Typography>

  </>
}
