# BUG REPORTS — Sarnik Project Management

Generated: 2025-12-29

This file collects the findings, reproduction steps, root causes, suggested fixes, and verification steps for issues found while reviewing the finance-related code in this repository.

---

## Scope
Files reviewed (representative):
- `src/Common/Currency/currencyHelper.jsx`
- `src/Component/Admin_Dashboard/modules/projects/finance/AddEditCostEstimate.jsx`
- `src/Component/Admin_Dashboard/modules/projects/finance/AddPO.jsx`
- `src/Component/Admin_Dashboard/modules/projects/finance/AddInvoice.jsx`
- `src/Component/Admin_Dashboard/modules/projects/tabs/FinanceTab.jsx`


---

## Issue Index (by priority)
- HIGH
  1. Currency parsing & locale mismatch (financial correctness)
  2. Storing/using formatted strings for calculations (data integrity)
  3. JSX parsing/build errors introduced by invalid edits (blocks dev server)
- MEDIUM
  4. Navigation after create/update uses hard-coded routes (UX inconsistency)
  5. Input sanitization restricts decimal separator to dot only (locale UX)
  6. Validation uses naive string replacements for numbers
  7. Finance tab not preserving active tab on back (UX)
- LOW
  8. Redundant `.toFixed(2)` before formatting
  9. Console.log noise and use of array index as React `key`


---

## Detailed Issues

### 1) Currency parsing & locale mismatch — HIGH
- Files: `currencyHelper.jsx`, `AddEditCostEstimate.jsx`, `AddInvoice.jsx`, `AddPO.jsx`
- Description: The display formatter produces locale-specific strings (group separators, decimal marks). The code later parses those formatted strings using assumptions that do not hold for all locales (e.g., it strips commas and expects dot decimal). This can corrupt numeric parsing and cause incorrect subtotal/VAT/total values.
- Reproduction:
  1. Set currency to `EUR` (locale mapped to `de-DE`).
  2. Enter or load a rate that includes a comma decimal or grouping (e.g. `1.234,56` or a formatted value returned from API).
  3. Observe subtotal or total being incorrect or NaN.
- Root cause: Mixing presentation (formatted strings) with data layer and parsing with dot-only assumptions. `formatCurrencyAmount` outputs locale strings but parsing uses `replace(/,/g, "")` and `parseFloat`.
- Suggested fix:
  - Add `parseCurrencyToNumber(formattedString, currency)` utility that uses the currency → locale mapping to determine grouping and decimal separators, strips grouping separators and replaces the locale decimal with `.`, then returns a Number.
  - Better: keep canonical numeric values in state (e.g., `rateRaw`) and only use formatting for UI display. Do not store formatted strings where numbers are required for math or API payloads.
- Verification:
  - Write unit tests for the parser for `USD`, `EUR`, `GBP`, `INR`, `AED`, `SAR` and manual checks in the UI.


### 2) Storing/using formatted strings for calculations — HIGH
- Files: `AddEditCostEstimate.jsx`, `AddInvoice.jsx`
- Description: Components format rate on blur and then store the formatted string back into state. Later calculations call `parseFloat(item.rate.replace(/,/g, ""))` which fails for locales using comma decimals or other grouping separators.
- Reproduction:
  - Edit a line item rate, blur (value becomes formatted), then check subtotal — may be wrong.
- Root cause: Presentation string saved into data state and parsed again for arithmetic.
- Suggested fix:
  - Store numeric value in state (`rateRaw`) and set a separate `rateDisplay` only for UI formatting. Use `rateRaw` for arithmetic and payloads.
  - Update `handleRateBlur` to only set `rateDisplay` without replacing the numeric state used for calculations.
- Verification: Correct subtotal/VAT/total, API sends numeric values.


### 3) JSX parse/build errors introduced by invalid edits — HIGH
- Files: `FinanceTab.jsx`
- Description: Recent edits created invalid JSX (nested `.map` blocks and/or unclosed tags) which caused the dev server to fail with parser errors: "Unexpected token", "Unterminated JSX contents".
- Reproduction: Start dev server; errors show in console and overlay with stack trace.
- Root cause: Bad intermediate code (duplicated nested maps and missing closing tags) introduced when changing tab behavior.
- Fix: Restore valid JSX structure. Use single `.map` for tabs and ensure tags are closed. The component should return a single root element.
- Verification: Dev server starts cleanly without parser errors.


### 4) Navigation after create/update uses hard-coded routes — MEDIUM
- Files: `AddEditCostEstimate.jsx`, `AddPO.jsx`, `AddInvoice.jsx`
- Description: After saving, pages navigate to fixed routes like `/admin/CostEstimates` or `/admin/Invoicing` rather than returning the user to the originating page. User requested behavior: navigate one step back in history.
- Reproduction: From project page open add form; save; app navigates to `/admin/CostEstimates` losing the origin context.
- Root cause: Hard-coded navigate calls.
- Suggested fix:
  - Use `navigate(-1)` where appropriate to go back one step.
  - For robustness: if `location.state?.from` exists, go to that; else if `window.history.length > 1` use `navigate(-1)`; fallback to a safe route if no history.
- Verification: Add/Save returns to origin; direct access fallback works.


### 5) Input sanitization restricts decimal separator to dot only — MEDIUM
- Files: `currencyHelper.jsx`, `AddEditCostEstimate.jsx`, `AddInvoice.jsx`
- Description: Input sanitization uses `replace(/[^0-9.]/g, "")`, which strips commas used as decimals in many locales. That prevents typing locale-correct decimals and causes UX friction.
- Reproduction: Set currency to EUR or select a locale user; try entering `1,23` and it gets stripped to `123`.
- Root cause: Regex only allows `.` as decimal.
- Fix:
  - Accept both `.` and `,` during input, then normalize using `parseCurrencyToNumber` before saving numeric state.
  - Alternatively limit UI to dot decimals and clearly document that input expects `.`.
- Verification: Input accepts `,` as decimal when using locales that expect it and normalizes correctly.


### 6) Validation uses naive string replacements — MEDIUM
- Files: `AddEditCostEstimate.jsx`
- Description: Validation checks `parseFloat(item.rate.replace(/,/g, "")) <= 0` and similar, which assumes comma is only a group separator. This fails for locales where comma is decimal.
- Fix: Use `parseCurrencyToNumber(item.rate, currency)` for validation.
- Verification: Validation behaves correctly across currencies.


### 7) Finance tab not preserving active tab on back — MEDIUM
- Files: `FinanceTab.jsx`
- Description: The tab UI defaults to `cost` in internal state and doesn't read from the URL query consistently; navigating back from add pages may show the default instead of the expected tab. Desired behavior: read `tab` from query string and keep it in sync with history.
- Fix: Read initial tab from `location.search` and update on `location.search` change (useEffect). On tab click, update query string via `navigate({ search: params.toString() })`. Ensure component updates active tab on URL change.
- Verification: Open `/projects/23?tab=invoice`, open add page, return → FinanceTab shows `invoice` active.


### 8) Redundant `.toFixed(2)` before formatting — LOW
- Files: `AddEditCostEstimate.jsx`, `AddInvoice.jsx`
- Description: `.toFixed(2)` is called before passing values to `formatCurrencyAmount`, which already ensures 2 decimal places. This is redundant and can convert numbers to strings prematurely.
- Fix: Pass numbers (or let helper accept numbers) and allow formatter to handle decimal precision.
- Verification: No change in display; simpler code.


### 9) Console logs and keys — LOW
- Files: various
- Description: `console.log` used for debugging; arrays use index as key in list rendering. Not critical but cleanup recommended.
- Fix: Remove or gate debug logs; prefer stable keys when list reordering is possible.


---

## Suggested Code Snippets

1) `parseCurrencyToNumber` (place in `src/Common/Currency/currencyHelper.jsx`):

```js
export function parseCurrencyToNumber(formatted, currency) {
  if (formatted === null || formatted === undefined || formatted === '') return NaN;
  const locale = localeMap[currency] || 'en-US';
  // Use Intl.NumberFormat to detect separators
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const group = parts.find(p => p.type === 'group')?.value || ',';
  const decimal = parts.find(p => p.type === 'decimal')?.value || '.';

  // Remove all grouping separators
  const withoutGroup = String(formatted).split(group).join('');
  // Replace locale decimal with '.'
  const normalized = withoutGroup.split(decimal).join('.');
  // Remove non numeric (except minus and dot)
  const cleaned = normalized.replace(/[^0-9.\-]/g, '');
  return Number(cleaned);
}
```

2) Store numeric state

- For line items, keep `rateRaw: number` and `rateDisplay: string` (optional).
- On change: parse input to `rateRaw` (allow `,` or `.`), update `rateDisplay` on blur using `formatCurrencyForDisplay(rateRaw, currency)`.
- Use `rateRaw` for `calculateSubtotal()` and for the API payload.

3) Robust post-submit navigation

```js
const goBackOrFallback = (fallback) => {
  if (location.state?.from) navigate(location.state.from);
  else if (window.history.length > 1) navigate(-1);
  else navigate(fallback);
};
```

Use: `goBackOrFallback('/admin/CostEstimates')` after saving.


---

## Testing / Verification Steps (manual)

1. Start dev server:

```bash
npm install
npm run dev
```

2. Fix any JSX parser errors first; confirm server builds.

3. Currency tests:
- Set currency to `USD` and `EUR`. Create a line item with a decimal and grouping. Verify subtotal, VAT, and total calculations are correct and API payload sends numeric values (check network tab).

4. Navigation tests:
- From a project page /projects/23?tab=invoice open Add Invoice → Save. Confirm you return to the project page and the Finance tab remains `invoice` active.
- Open Add Invoice directly in a new tab and save → check fallback navigation (safe route).

5. Input tests:
- Try entering `1,234.56`, `1.234,56`, and `1234.56` for different currencies. Verify stored numeric values are identical and totals are correct.

6. Validation tests:
- Supply zero and negative values for rate and quantity and verify the UI prevents submission with proper messages.


---

## Next Steps (recommended priority order)
1. Implement `parseCurrencyToNumber` helper and its unit tests. Replace all naïve `replace(/,/g, "")` usages. (High)
2. Refactor line item `rate` state to keep numeric `rateRaw` separate from display, update calculation functions to use `rateRaw`. (High)
3. Ensure `FinanceTab` reads from URL query `tab` and updates on history changes. (Medium)
4. Replace hard-coded post-submit navigation with `navigate(-1)` or origin-aware fallback where appropriate. (Medium)
5. Update input sanitization to accept both `.` and `,` in input and normalize. (Medium)
6. Remove redundant `.toFixed(2)` calls. Clean console logs. (Low)


---

If you want, I can implement the top-priority changes now (1 and 2): add `parseCurrencyToNumber` to `currencyHelper.jsx`, then refactor `AddEditCostEstimate.jsx` and `AddInvoice.jsx` to use numeric state for rates and to send numeric values to the API. Reply with "Implement parser and refactor" and I will apply the changes and run quick checks.


---

File created at repository root: `BUG_REPORTS.md`

