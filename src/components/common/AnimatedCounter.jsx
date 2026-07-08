// ============================================================================
// AnimatedCounter — smoothly counts up to a target numeric value.
// Used inside summary cards for that "premium fintech" feel.
// ============================================================================
import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { Typography } from '@mui/material';

export default function AnimatedCounter({ value = 0, prefix = '', suffix = '', variant = 'h4', sx = {} }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <Typography variant={variant} sx={{ fontWeight: 700, letterSpacing: '-0.02em', ...sx }}>
      {prefix}
      {Math.round(display).toLocaleString('en-IN')}
      {suffix}
    </Typography>
  );
}
