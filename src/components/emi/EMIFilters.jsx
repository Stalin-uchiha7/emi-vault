// ============================================================================
// EMIFilters — search box + status/category filter chips for the EMI table.
// ============================================================================
import { Box, TextField, InputAdornment, Chip, Stack } from '@mui/material';
import { Search } from 'lucide-react';
import { LOAN_CATEGORIES } from '../../constants';

const statusFilters = ['All', 'Active', 'Closed', 'Upcoming Due', 'Overdue'];

export default function EMIFilters({ search, onSearchChange, statusFilter, onStatusChange, categoryFilter, onCategoryChange }) {
  return (
    <Stack spacing={1.5} sx={{ mb: 2.5 }}>
      <TextField
        placeholder="Search by loan name, bank, or category…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        fullWidth
        InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }}
        sx={{ maxWidth: 480 }}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {statusFilters.map((s) => (
          <Chip
            key={s}
            label={s}
            onClick={() => onStatusChange(s)}
            color={statusFilter === s ? 'primary' : 'default'}
            variant={statusFilter === s ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600 }}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label="All Categories"
          onClick={() => onCategoryChange('All')}
          color={categoryFilter === 'All' ? 'primary' : 'default'}
          variant={categoryFilter === 'All' ? 'filled' : 'outlined'}
          size="small"
        />
        {LOAN_CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            onClick={() => onCategoryChange(c)}
            color={categoryFilter === c ? 'primary' : 'default'}
            variant={categoryFilter === c ? 'filled' : 'outlined'}
            size="small"
          />
        ))}
      </Box>
    </Stack>
  );
}
