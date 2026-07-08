// ============================================================================
// ProgressRing — animated SVG circular progress indicator for loan repayment %
// ============================================================================
import { useEffect, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

export default function ProgressRing({ percent = 0, size = 56, strokeWidth = 5, color, label }) {
  const theme = useTheme();
  const ringColor = color || theme.palette.primary.main;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(percent), 100);
    return () => clearTimeout(t);
  }, [percent]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, display: 'inline-flex' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={theme.palette.mode === 'light' ? '#EEF0F5' : '#2A2A38'}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: size / 4.2, fontWeight: 700 }}>
          {label ?? `${Math.round(percent)}%`}
        </Typography>
      </Box>
    </Box>
  );
}
