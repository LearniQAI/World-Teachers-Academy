// Salary text for a job listing, shown only as far as the source supports it.
//
// What the feeds give us: a minimum and/or maximum and the market currency —
// but NOT the pay period. Reed mixes annual, daily and hourly rates in the
// same fields (e.g. £28,000–£38,000, £145–£215, £14.25–£16.65); Adzuna
// sometimes sends 0 as a placeholder minimum.
//
// Rules:
// - A missing or zero value is never shown as a salary. Nothing usable →
//   "Salary not specified".
// - Only one side usable → "Up to …" / "From …".
// - The currency is always shown as its ISO code (AUD, GBP, ZAR…), so "$"
//   is never ambiguous.
// - "a year" is added only when the figure is clearly an annual salary for
//   that currency (at or above ANNUAL_FLOOR). Below that, the period is
//   unknown, so the amount is shown with "rate as advertised" instead of
//   guessing per day / per hour / per month.
// - When the source states the period (Teaching Vacancies, USAJOBS, Reed's
//   salary type → stored as salary_period), that period is shown instead.
// - Adzuna marks some salaries as its own estimate (salary_is_predicted).
//   An estimate is not what the employer advertised, so it is not shown.

export type SalaryInput = {
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  salary_period?: "year" | "month" | "week" | "day" | "hour" | null;
  salary_is_predicted?: boolean | null;
};

const PERIOD_TEXT = { year: " a year", month: " a month", week: " a week", day: " a day", hour: " an hour" } as const;

// Lowest figure we treat as an annual salary, per currency. Chosen well below
// any full-time annual teaching salary in these markets and well above typical
// daily/monthly rates. Unknown currency → never labelled annual.
const ANNUAL_FLOOR: Record<string, number> = {
  GBP: 10_000,
  EUR: 12_000,
  USD: 15_000,
  CAD: 20_000,
  AUD: 30_000,
  SGD: 15_000,
  ZAR: 60_000,
  INR: 100_000,
};

export const SALARY_NOT_SPECIFIED = "Salary not specified";

function amount(n: number): string {
  if (n >= 100_000) return `${Math.round(n / 1000).toLocaleString("en-GB")}K`;
  if (n >= 10_000) return `${(Math.round(n / 100) / 10).toLocaleString("en-GB")}K`;
  return n.toLocaleString("en-GB", { maximumFractionDigits: 2 });
}

export function formatSalary({ salary_min, salary_max, currency, salary_period, salary_is_predicted }: SalaryInput): {
  text: string;
  specified: boolean;
} {
  const min = salary_min != null && salary_min > 0 ? salary_min : null;
  const max = salary_max != null && salary_max > 0 ? salary_max : null;
  if ((min == null && max == null) || salary_is_predicted) return { text: SALARY_NOT_SPECIFIED, specified: false };

  const code = currency ? `${currency} ` : "";
  const top = (max ?? min)!;
  const floor = currency ? ANNUAL_FLOOR[currency] : undefined;
  const period = salary_period
    ? PERIOD_TEXT[salary_period]
    : floor != null && top >= floor
      ? " a year"
      : " · rate as advertised";

  let text: string;
  if (min != null && max != null) text = `${code}${min === max ? amount(min) : `${amount(min)}–${amount(max)}`}`;
  else if (max != null) text = `Up to ${code}${amount(max)}`;
  else text = `From ${code}${amount(min!)}`;
  return { text: `${text}${period}`, specified: true };
}
