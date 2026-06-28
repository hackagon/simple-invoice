import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './api';

function axiosErrorWith(data: unknown, message = 'Request failed'): AxiosError {
  const err = new AxiosError(message);
  err.response = { data } as never;
  return err;
}

describe('getErrorMessage', () => {
  it('returns a string message from the response body', () => {
    expect(getErrorMessage(axiosErrorWith({ message: 'Invoice not found' }))).toBe(
      'Invoice not found',
    );
  });

  it('joins an array of validation messages', () => {
    expect(
      getErrorMessage(axiosErrorWith({ message: ['a is required', 'b is invalid'] })),
    ).toBe('a is required, b is invalid');
  });

  it('falls back to the axios error message when the body has none', () => {
    expect(getErrorMessage(axiosErrorWith({}, 'Network Error'))).toBe('Network Error');
  });

  it('returns the provided fallback for a non-axios error', () => {
    expect(getErrorMessage(new Error('boom'), 'Something went wrong')).toBe(
      'Something went wrong',
    );
  });
});
