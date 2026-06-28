import { ValueTransformer } from 'typeorm';

/**
 * The `pg` driver returns numeric/decimal columns as strings to avoid
 * precision loss. For this application amounts comfortably fit within a
 * JS number, so we transform them back to numbers on read for clean JSON.
 */
export const DecimalTransformer: ValueTransformer = {
  to: (value?: number | null): number | null | undefined => value,
  from: (value?: string | null): number | null => {
    if (value === null || value === undefined) return null;
    return parseFloat(value);
  },
};
