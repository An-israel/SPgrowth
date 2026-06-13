export const TOTAL_DAYS = 21;

/**
 * Compute the "current" program day (1-21) from the program start date.
 * Used only for highlighting/default-selection — all days are always accessible.
 */
export function getCurrentProgramDay(programStartDate: string | Date): number {
  const start = new Date(programStartDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const day = diffDays + 1;

  if (day < 1) return 1;
  if (day > TOTAL_DAYS) return TOTAL_DAYS;
  return day;
}

/**
 * "Expected" number of completed days given how far into the program we are.
 * Used by the admin dashboard to flag users who are falling behind.
 */
export function getExpectedCompletedDays(programStartDate: string | Date): number {
  return getCurrentProgramDay(programStartDate);
}

export function weekForDay(dayNumber: number): number {
  return Math.ceil(dayNumber / 7);
}

export function isProgressComplete(p: {
  reading_done: boolean;
  exercise_done: boolean;
  prayer_done: boolean;
}): boolean {
  return p.reading_done && p.exercise_done && p.prayer_done;
}

export const GRADUATION_PRAYER =
  "Father, thank You for the work You have begun in me. Help me continue growing in grace, knowledge, love, faith, and spiritual maturity. Teach me to walk with You daily and become the person You have called me to be. In Jesus' name, Amen.";

export const THEME_SCRIPTURE =
  "but, speaking the truth in love, may grow up in all things into Him who is the head—Christ—";
export const THEME_SCRIPTURE_REF = "Ephesians 4:15 (NKJV)";
