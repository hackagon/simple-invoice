import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '..';

function Trigger({ text, kind }: { text: string; kind?: 'success' | 'error' }) {
  const { notify } = useToast();
  return (
    <button type="button" onClick={() => notify(text, kind)}>
      fire
    </button>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows a toast on notify and auto-dismisses after 4s', () => {
    render(
      <ToastProvider>
        <Trigger text="Saved!" kind="success" />
      </ToastProvider>,
    );

    expect(screen.queryByText('Saved!')).toBeNull();

    act(() => screen.getByRole('button', { name: 'fire' }).click());
    expect(screen.getByText('Saved!')).toHaveClass('toast', 'toast--success');

    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByText('Saved!')).toBeNull();
  });
});
