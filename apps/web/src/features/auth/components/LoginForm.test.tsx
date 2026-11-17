import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LoginInput } from '@notifyhub/shared';
import { LoginForm } from '@/features/auth/components/LoginForm';

afterEach(cleanup);

describe('LoginForm', () => {
  it('prevents submission when credentials are invalid', async () => {
    const onSubmit = vi.fn<(values: LoginInput) => void>();
    render(<LoginForm isSubmitting={false} errorMessage={null} onSubmit={onSubmit} />);

    const email = screen.getByLabelText('E-posta adresi');
    const password = screen.getByLabelText('Şifre');
    fireEvent.change(email, { target: { value: 'not-an-email' } });
    fireEvent.change(password, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Güvenle giriş yap' }));

    await waitFor(() => {
      expect(email.getAttribute('aria-invalid')).toBe('true');
      expect(password.getAttribute('aria-invalid')).toBe('true');
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits normalized credentials after validation', async () => {
    const onSubmit = vi.fn<(values: LoginInput) => void>();
    render(<LoginForm isSubmitting={false} errorMessage={null} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('E-posta adresi'), {
      target: { value: ' PERSON@EXAMPLE.COM ' },
    });
    fireEvent.change(screen.getByLabelText('Şifre'), { target: { value: 'safe-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Güvenle giriş yap' }));

    await waitFor(() => {
      expect(onSubmit.mock.calls[0]?.[0]).toEqual({
        email: 'person@example.com',
        password: 'safe-password',
      });
    });
  });
});
