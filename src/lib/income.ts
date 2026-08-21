/**
 * Preply keeps 18% commission on lesson revenue; the tutor receives 82%.
 * A month is treated as 52 / 12 ≈ 4.33 weeks so the "monthly" estimate
 * matches an actual calendar year rather than a naive "4 weeks a month".
 */
export const PREPLY_COMMISSION_RATE = 0.18;
export const WEEKS_PER_MONTH = 52 / 12;

export interface IncomeBreakdown {
  weeklyGross: number;
  monthlyGross: number;
  commission: number;
  monthlyNet: number;
}

const EMPTY: IncomeBreakdown = {
  weeklyGross: 0,
  monthlyGross: 0,
  commission: 0,
  monthlyNet: 0,
};

/** Estimated monthly income for a single student, assuming every planned lesson happens. */
export function calculateStudentIncome(
  hourlyFee: number | null,
  lessonsPerWeek: number,
): IncomeBreakdown {
  const fee = hourlyFee ?? 0;
  const lessons = Math.max(0, lessonsPerWeek || 0);
  const weeklyGross = fee * lessons;
  const monthlyGross = weeklyGross * WEEKS_PER_MONTH;
  const commission = monthlyGross * PREPLY_COMMISSION_RATE;
  const monthlyNet = monthlyGross - commission;
  return { weeklyGross, monthlyGross, commission, monthlyNet };
}

/** Sum of every student's estimated monthly income. */
export function calculateTotalIncome(
  students: { hourly_fee: number | null; lessons_per_week: number }[],
): IncomeBreakdown {
  return students.reduce<IncomeBreakdown>((acc, s) => {
    const one = calculateStudentIncome(s.hourly_fee, s.lessons_per_week);
    return {
      weeklyGross: acc.weeklyGross + one.weeklyGross,
      monthlyGross: acc.monthlyGross + one.monthlyGross,
      commission: acc.commission + one.commission,
      monthlyNet: acc.monthlyNet + one.monthlyNet,
    };
  }, EMPTY);
}
