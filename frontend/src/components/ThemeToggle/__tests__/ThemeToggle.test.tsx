import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { ThemeToggle } from '..';

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to light and applies data-theme', () => {
    renderToggle();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggles to dark, persists, and back to light', async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('simpleinvoice.theme')).toBe('dark');

    await user.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('simpleinvoice.theme')).toBe('light');
  });

  it('reads a persisted theme on mount', () => {
    localStorage.setItem('simpleinvoice.theme', 'dark');
    renderToggle();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
