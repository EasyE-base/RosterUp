import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../tests/utils/test-utils';
import ProtectedRoute from './ProtectedRoute';
import * as AuthContext from '../contexts/AuthContext';

// Mock the useAuth hook
vi.mock('../contexts/AuthContext', () => ({
  ...vi.importActual('../contexts/AuthContext'),
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  it('should show loading spinner when loading', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: true,
      session: null,
      profile: null,
      organization: null,
      player: null,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Check for loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { id: '123', email: 'test@example.com' } as any,
      loading: false,
      session: {} as any,
      profile: {} as any,
      organization: null,
      player: null,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      loading: false,
      session: null,
      profile: null,
      organization: null,
      player: null,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should not render protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});