import type { Student } from "@/lib/types";

/** Preply keeps 18% of a tutor's gross earnings. */
export const PREPLY_COMMISSION_RATE = 0.18;

/** 52 weeks ÷ 12 months for smoothing weekly plans into monthly figures. */
export const WEEKS_PER_MONTH = 52 / 12;

export interface IncomeBreakdown {
  weeklyGross: number;
  monthlyGross: number;
  commission: number;
  monthlyNet: number;
}

const EMPTY_BREAKDOWN: IncomeBreakdown = {
  weeklyGross: 0,
  monthlyGross: 0,
  commission: 0,
  monthlyNet: 0,
};

export function calculateStudentIncome(
  hourlyFee: number | null,
  lessonsPerWeek: number,
): IncomeBreakdown {
  const fee = hourlyFee ?? 0;
  const weeklyGross = fee * lessonsPerWeek;
  const monthlyGross = weeklyGross * WEEKS_PER_MONTH;
  const commission = monthlyGross * PREPLY_COMMISSION_RATE;
  const monthlyNet = monthlyGross - commission;
  return { weeklyGross, monthlyGross, commission, monthlyNet };
}

export function calculateTotalIncome(students: Student[]): IncomeBreakdown {
  return students.reduce<IncomeBreakdown>((acc, s) => {
    const r = calculateStudentIncome(s.hourly_fee, s.lessons_per_week);
    return {
      weeklyGross: acc.weeklyGross + r.weeklyGross,
      monthlyGross: acc.monthlyGross + r.monthlyGross,
      commission: acc.commission + r.commission,
      monthlyNet: acc.monthlyNet + r.monthlyNet,
    };
  }, EMPTY_BREAKDOWN);
}
