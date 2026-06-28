import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserMenu } from '..';

const navigateMock = vi.fn();
const logoutMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('../../../auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'admin@101digital.io', fullname: 'Reviewer Admin' },
    logout: logoutMock,
  }),
}));

function renderMenu() {
  return render(
    <MemoryRouter>
      <UserMenu />
    </MemoryRouter>,
  );
}

const avatar = () => screen.getByRole('button', { name: /account menu/i });

describe('UserMenu', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    logoutMock.mockReset();
  });

  it('shows initials and is closed by default', () => {
    renderMenu();
    expect(avatar()).toHaveTextContent('RA');
    expect(screen.queryByRole('menuitem', { name: 'Profile' })).toBeNull();
  });

  it('opens the menu with Profile and Logout on click', async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(avatar());
    expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Logout' })).toBeInTheDocument();
  });

  it('navigates to /profile from the Profile item', async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(avatar());
    await user.click(screen.getByRole('menuitem', { name: 'Profile' }));
    expect(navigateMock).toHaveBeenCalledWith('/profile');
  });

  it('logs out and redirects from the Logout item', async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(avatar());
    await user.click(screen.getByRole('menuitem', { name: 'Logout' }));
    expect(logoutMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true });
  });
});
