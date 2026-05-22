// Currency → Locale map
const localeMap = {
  AED: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  INR: "en-IN",
  SAR: "en-US",
  USD: "en-US",
};

const escapeForRegex = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

export const parseCurrencyToNumber = (formatted, currency) => {
  if (formatted === null || formatted === undefined || formatted === "") return NaN;

  // If already a number, return it
  if (typeof formatted === 'number') return formatted;

  const locale = localeMap[currency] || "en-US";

  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const group = parts.find(p => p.type === 'group')?.value || ',';
    const decimal = parts.find(p => p.type === 'decimal')?.value || '.';

    // Normalize string: remove grouping separators, replace decimal with dot
    let s = String(formatted).trim();

    // Sometimes group char may be non-breaking space, normalize whitespace first
    s = s.replace(/\u00A0/g, ' ');

    // Remove all occurrences of group separator
    const groupRegex = new RegExp(escapeForRegex(group), 'g');
    s = s.replace(groupRegex, '');

    // Replace decimal separator with dot
    if (decimal !== '.') {
      const decRegex = new RegExp(escapeForRegex(decimal), 'g');
      s = s.replace(decRegex, '.');
    }

    // Remove any non-digit except dot and minus
    s = s.replace(/[^0-9.\-]/g, '');

    if (s === '' || s === '.' || s === '-' || s === '-.' ) return NaN;

    return Number(s);
  } catch (e) {
    // Fallback: strip commas and spaces and parse
    const cleaned = String(formatted).replace(/[ ,\u00A0]/g, '').replace(/[^0-9.\-]/g, '');
    return Number(cleaned);
  }
};

export const formatCurrencyAmount = (value, currency) => {
  if (value === '' || value === null || value === undefined) return '';

  // Preserve user's typing if they end with a dot
  if (typeof value === 'string' && value.endsWith('.')) return value;

  // If value is a string, try to parse to number
  const number = typeof value === 'number' ? value : parseCurrencyToNumber(value, currency);
  if (isNaN(number)) return '';

  return new Intl.NumberFormat(
    localeMap[currency] || 'en-US',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(number);
};