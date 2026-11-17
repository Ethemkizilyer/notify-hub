import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  InputAdornment,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { listUsersQuerySchema } from '@notifyhub/shared';
import { EmptyState } from '@/components/EmptyState';
import { PageHeading } from '@/components/PageHeading';
import { useAdminUsers } from '@/features/admin/hooks/use-admin-users';
import { getErrorMessage } from '@/utils/get-error-message';

const PAGE_SIZE = 10;

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const query = listUsersQuerySchema.parse({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });
  const users = useAdminUsers(query);

  return (
    <Box>
      <PageHeading
        eyebrow="YÖNETİM PANELİ / HESAPLAR"
        title="Kullanıcılar"
        description="Kayıtlı hesapları ara ve kullanıcı bilgilerini görüntüle."
      />

      {users.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void users.refetch()}>
              Tekrar dene
            </Button>
          }
          sx={{ mb: 2.5, borderRadius: 3 }}
        >
          {getErrorMessage(users.error)}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            p: 2.5,
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography variant="h6">Hesap dizini</Typography>
            <Typography variant="body2" color="text.secondary">
              {users.data?.meta.total ?? 0} kullanıcı hesabı
            </Typography>
          </Box>
          <TextField
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Ad veya e-posta ara"
            aria-label="Ad veya e-posta ara"
            sx={{ width: { xs: '100%', sm: 300 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>

        {users.isLoading ? (
          <Stack spacing={1} sx={{ p: 2.5 }}>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} height={58} />
            ))}
          </Stack>
        ) : users.data?.data.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <EmptyState
              icon={<PeopleAltOutlinedIcon />}
              title={search ? 'Eşleşen hesap yok' : 'Henüz kullanıcı yok'}
              description={
                search
                  ? 'Başka bir ad veya e-posta ile aramayı dene.'
                  : 'Yeni kayıt olan kullanıcılar burada listelenecek.'
              }
              actionLabel={search ? 'Aramayı temizle' : undefined}
              onAction={search ? () => setSearchInput('') : undefined}
            />
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 620 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Kullanıcı</TableCell>
                  <TableCell>E-posta</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Kayıt tarihi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.data?.data.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: 'action.hover',
                            color: 'primary.main',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                          }}
                        >
                          {user.fullName.slice(0, 1).toLocaleUpperCase('tr-TR')}
                        </Avatar>
                        <Typography variant="subtitle2">{user.fullName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
                        color={user.role === 'ADMIN' ? 'secondary' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {users.data && users.data.meta.totalPages > 1 && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              px: 2.5,
              py: 1.75,
              borderTop: 1,
              borderColor: 'divider',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Sayfa {page} / {users.data.meta.totalPages}
            </Typography>
            <Pagination
              count={users.data.meta.totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
              shape="rounded"
            />
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
