// ============================================================================
// SummaryCard — glassmorphic KPI card used across the top of the Dashboard.
// Accepts either a numeric `value` (rendered via AnimatedCounter) or a raw
// `customValue` node (e.g. a formatted date for "Next EMI Due").
// ============================================================================
import { Box, Typography, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

export default function SummaryCard({ label, value, customValue, prefix = '', suffix = '', icon: Icon, accent = '#635BFF', delay = 0 }) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      style={{ height: '100%' }}
    >
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          p: 2.5,
          borderRadius: '20px',
          overflow: 'hidden',
          background: isLight
            ? `linear-gradient(135deg, ${alpha('#fff', 0.9)}, ${alpha('#fff', 0.6)})`
            : `linear-gradient(135deg, ${alpha('#26263a', 0.9)}, ${alpha('#1a1a26', 0.6)})`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isLight ? alpha('#111', 0.06) : alpha('#fff', 0.08)}`,
          boxShadow: isLight
            ? '0px 8px 30px rgba(16,24,40,0.06)'
            : '0px 8px 30px rgba(0,0,0,0.4)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: alpha(accent, isLight ? 0.12 : 0.18),
            filter: 'blur(10px)',
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          {Icon && (
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: alpha(accent, isLight ? 0.12 : 0.18),
                color: accent,
              }}
            >
              <Icon size={18} strokeWidth={2.2} />
            </Box>
          )}
        </Box>
        {customValue ? (
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
            {customValue}
          </Typography>
        ) : (
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} variant="h5" />
        )}
      </Box>
    </motion.div>
  );
}
