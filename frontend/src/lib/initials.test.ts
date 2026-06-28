import { describe, expect, it } from 'vitest';
import { getInitials } from './initials';

describe('getInitials', () => {
  it('returns ? for empty or blank input', () => {
    expect(getInitials('')).toBe('?');
    expect(getInitials('   ')).toBe('?');
  });

  it('uses the first two letters of a single token', () => {
    expect(getInitials('Paul')).toBe('PA');
    expect(getInitials('admin@101digital.io')).toBe('AD');
  });

  it('uses first + last initials for multiple words', () => {
    expect(getInitials('Reviewer Admin')).toBe('RA');
    expect(getInitials('jane cooper smith')).toBe('JS');
  });
});
