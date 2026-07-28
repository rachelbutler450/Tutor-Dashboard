/**
 * Returns the date of the most recent Monday (the start of the current week)
 * as a `YYYY-MM-DD` string, suitable for comparing against a Postgres `date`
 * column. Weeks are treated as Monday → Sunday.
 */
export function getWeekStartMonday(now: Date = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return toIsoDate(d);
}

/** Returns the first day of the current month as a `YYYY-MM-DD` string. */
export function getMonthStart(now: Date = new Date()): string {
  return toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
}

function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

/** Formats a `YYYY-MM-DD` (or ISO) date string as e.g. "May 26, 2026". */
export function formatDate(value: string): string {
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Formats an optional numeric fee as a per-hour rate, e.g. "$40.00/hr". */
export function formatHourlyFee(fee: number | null): string {
  if (fee === null || fee === undefined) return "—";
  return `$${Number(fee).toFixed(2)}/hr`;
}

/** Formats a number as USD, e.g. `1234.5` → `"$1,235"`. */
export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Full-precision USD formatting, e.g. `1234.5` → `"$1,234.50"`. */
export function formatMoneyPrecise(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
