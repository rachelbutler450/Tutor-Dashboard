/** e.g. `40` → `"$40.00/hr"`; `null` → `"—"`. */
export function formatHourlyFee(fee: number | null): string {
  if (fee === null || fee === undefined) return "—";
  return `$${Number(fee).toFixed(2)}/hr`;
}

/** Whole-dollar USD, e.g. `1234.5` → `"$1,235"`. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Two-decimal USD, e.g. `1234.5` → `"$1,234.50"`. */
export function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
