/** Formats an optional numeric fee as a per-hour rate, e.g. "$40.00/hr". */
export function formatHourlyFee(fee: number | null): string {
  if (fee === null || fee === undefined) return "—";
  return `$${Number(fee).toFixed(2)}/hr`;
}

/** Whole-dollar currency ("$3,140"). Use for headline numbers. */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Precise 2-decimal currency ("$3,140.75"). Use for detailed breakdowns. */
export function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
