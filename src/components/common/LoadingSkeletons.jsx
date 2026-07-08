// ============================================================================
// Loading skeletons — reusable placeholders shown while Firestore data loads.
// ============================================================================
import { Box, Skeleton, Grid, Stack } from '@mui/material';

export function SummaryCardsSkeleton({ count = 8 }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Skeleton variant="rounded" height={110} sx={{ borderRadius: '20px' }} />
        </Grid>
      ))}
    </Grid>
  );
}

export function ChartsSkeleton({ count = 3 }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item xs={12} md={4} key={i}>
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: '20px' }} />
        </Grid>
      ))}
    </Grid>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <Stack spacing={1.2}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: '14px' }} />
      ))}
    </Stack>
  );
}

export function DetailPageSkeleton() {
  return (
    <Box>
      <Skeleton variant="rounded" height={140} sx={{ borderRadius: '20px', mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: '20px' }} />
        </Grid>
        <Grid item xs={12} md={5}>
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: '20px' }} />
        </Grid>
      </Grid>
    </Box>
  );
}
