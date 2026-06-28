import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { InvoiceStatus } from '../../../types/invoice';
import { StatusBadge } from '..';

describe('StatusBadge', () => {
  it('renders the status text with a lowercased modifier class', () => {
    render(<StatusBadge status="Overdue" />);
    expect(screen.getByText('Overdue')).toHaveClass('badge', 'badge--overdue');
  });

  it('renders a distinct class for each status', () => {
    const statuses: InvoiceStatus[] = ['Draft', 'Pending', 'Paid', 'Overdue'];
    for (const status of statuses) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(status)).toHaveClass(`badge--${status.toLowerCase()}`);
      unmount();
    }
  });
});
