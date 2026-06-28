/** Maps common ISO 4217 currency codes to a display symbol. */
const CURRENCY_SYMBOLS: Record<string, string> = {
  AUD: 'AU$',
  USD: 'US$',
  GBP: '£',
  EUR: '€',
  SGD: 'S$',
  NZD: 'NZ$',
  CAD: 'CA$',
  JPY: '¥',
  INR: '₹',
};

export function currencySymbolFor(code: string): string {
  return CURRENCY_SYMBOLS[code.toUpperCase()] ?? code.toUpperCase();
}
