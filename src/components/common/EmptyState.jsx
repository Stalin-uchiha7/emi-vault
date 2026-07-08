// ============================================================================
// EmptyState — friendly placeholder shown when a list/table has no data.
// ============================================================================
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, actionLabel, onAction }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
          px: 3,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            mb: 2,
            color: 'text.secondary',
          }}
        >
          <Icon size={28} strokeWidth={1.5} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340, mb: actionLabel ? 3 : 0 }}>
            {description}
          </Typography>
        )}
        {actionLabel && (
          <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
            {actionLabel}
          </Button>
        )}
      </Box>
    </motion.div>
  );
}
