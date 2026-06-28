import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from '..';

function setup(overrides: Partial<Parameters<typeof Pagination>[0]> = {}) {
  const onPageChange = vi.fn();
  const onPageSizeChange = vi.fn();
  render(
    <Pagination
      page={1}
      pageSize={10}
      total={32}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      {...overrides}
    />,
  );
  return { onPageChange, onPageSizeChange };
}

const prev = () => screen.getByRole('button', { name: /previous page/i });
const next = () => screen.getByRole('button', { name: /next page/i });

describe('Pagination', () => {
  it('shows the current range and total pages', () => {
    setup({ page: 1, pageSize: 10, total: 32 });
    expect(screen.getByText(/Showing/)).toHaveTextContent('Showing 1–10 of 32');
    expect(screen.getByText(/Page 1 of 4/)).toBeInTheDocument();
  });

  it('disables Prev on the first page', () => {
    setup({ page: 1 });
    expect(prev()).toBeDisabled();
    expect(next()).toBeEnabled();
  });

  it('disables Next on the last page', () => {
    setup({ page: 4, pageSize: 10, total: 32 });
    expect(next()).toBeDisabled();
    expect(prev()).toBeEnabled();
  });

  it('calls onPageChange when navigating', async () => {
    const user = userEvent.setup();
    const { onPageChange } = setup({ page: 2 });
    await user.click(prev());
    expect(onPageChange).toHaveBeenCalledWith(1);
    await user.click(next());
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageSizeChange when changing rows per page', async () => {
    const user = userEvent.setup();
    const { onPageSizeChange } = setup();
    await user.selectOptions(screen.getByLabelText(/rows per page/i), '20');
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
