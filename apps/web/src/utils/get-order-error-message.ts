import axios from 'axios';
import type { ApiErrorBody } from '@notifyhub/shared';
import { getErrorMessage } from '@/utils/get-error-message';

export function getOrderErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const apiError = error.response?.data?.error;
    if (apiError?.code === 'CONFLICT' && apiError.message.toLowerCase().includes('stock')) {
      return 'Sepetindeki ürünlerden birinin stoğu değişmiş. Ürünleri kontrol edip tekrar dene.';
    }
  }

  return getErrorMessage(error);
}
