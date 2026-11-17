import axios from 'axios';
import type { ApiErrorBody } from '@notifyhub/shared';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.error?.message ?? error.message;
  }
  return 'Beklenmeyen bir hata oluştu';
}
