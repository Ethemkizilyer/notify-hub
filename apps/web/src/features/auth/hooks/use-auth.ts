import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { login, register } from '@/features/auth/api/auth.api';

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: (session) => useAuthStore.getState().setSession(session),
  });
}

export function useRegister() {
  return useMutation({ mutationFn: register });
}
