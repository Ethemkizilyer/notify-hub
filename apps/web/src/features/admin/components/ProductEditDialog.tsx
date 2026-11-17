import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { updateProductSchema, type UpdateProductInput } from '@notifyhub/shared';
import type { Product } from '@/types/domain';
import { getErrorMessage } from '@/utils/get-error-message';

type ProductEditDialogProps = {
  product: Product | null;
  isPending: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (id: string, input: UpdateProductInput) => void;
};

export function ProductEditDialog({
  product,
  isPending,
  error,
  onClose,
  onSubmit,
}: ProductEditDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
  });

  useEffect(() => {
    if (!product) return;
    reset({
      name: product.name,
      description: product.description ?? '',
      priceCents: product.priceCents,
      stock: product.stock,
    });
  }, [product, reset]);

  function submit(values: UpdateProductInput) {
    if (!product) return;
    onSubmit(product.id, updateProductSchema.parse(values));
  }

  return (
    <Dialog open={!!product} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 0.5 }}>Ürünü düzenle</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="edit-product-form"
          spacing={2}
          noValidate
          sx={{ pt: 1.5 }}
          onSubmit={(event) => void handleSubmit(submit)(event)}
        >
          <TextField
            label="Ürün adı"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Açıklama"
            multiline
            minRows={3}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <Controller
            control={control}
            name="priceCents"
            render={({ field }) => (
              <TextField
                label="Fiyat (TL)"
                type="number"
                value={field.value === undefined ? '' : field.value / 100}
                onChange={(event) => {
                  const value = event.target.value;
                  field.onChange(value === '' ? undefined : Math.round(Number(value) * 100));
                }}
                onBlur={field.onBlur}
                inputRef={field.ref}
                error={!!errors.priceCents}
                helperText={errors.priceCents?.message || 'Örn. 149.90'}
                slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
              />
            )}
          />
          <TextField
            label="Stok adedi"
            type="number"
            {...register('stock', { valueAsNumber: true })}
            error={!!errors.stock}
            helperText={errors.stock?.message}
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
          />
          {error !== null && error !== undefined && (
            <Alert severity="error">{getErrorMessage(error)}</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={isPending}>
          Vazgeç
        </Button>
        <Button type="submit" form="edit-product-form" variant="contained" disabled={isPending}>
          {isPending ? 'Kaydediliyor…' : 'Değişiklikleri kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
