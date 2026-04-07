/** Returns "YYYY-MM-DD" for a given Date object (local time) */
export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Today's date as "YYYY-MM-DD" */
export function today() {
  return toISODate(new Date());
}

/** e.g. "2026-04-07" → "Apr 7, 2026" */
export function toDisplayDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** e.g. "14:30" → "2:30 PM" */
export function toDisplayTime(isoTime) {
  if (!isoTime) return '';
  const [h, m] = isoTime.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function isToday(isoDate) {
  return isoDate === today();
}

export function isPastDue(isoDate, isoTime) {
  if (!isoDate) return false;
  const now = new Date();
  const [y, m, d] = isoDate.split('-').map(Number);
  if (isoTime) {
    const [h, min] = isoTime.split(':').map(Number);
    return new Date(y, m - 1, d, h, min) < now;
  }
  // no time — past due if the date itself has passed (not today)
  return new Date(y, m - 1, d, 23, 59, 59) < now;
}

/** Number of days in a given month (1-based month) */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/** 0 = Sunday, 6 = Saturday — day of week for the 1st of the month */
export function getStartDayOfWeek(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

/** Build the flat array of day cells for a calendar month grid.
 *  Returns objects: { date: "YYYY-MM-DD" | null, day: number, inMonth: boolean }
 *  Includes leading/trailing nulls to fill the 7-column grid.
 */
export function buildMonthGrid(year, month) {
  const totalDays = getDaysInMonth(year, month);
  const startOffset = getStartDayOfWeek(year, month);
  const cells = [];

  // leading empty cells
  for (let i = 0; i < startOffset; i++) {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevTotal = getDaysInMonth(prevYear, prevMonth);
    const day = prevTotal - startOffset + i + 1;
    cells.push({ date: toISODate(new Date(prevYear, prevMonth - 1, day)), day, inMonth: false });
  }

  // current month
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ date: toISODate(new Date(year, month - 1, d)), day: d, inMonth: true });
  }

  // trailing empty cells to complete last row
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const fill = 7 - remainder;
    for (let d = 1; d <= fill; d++) {
      cells.push({ date: toISODate(new Date(nextYear, nextMonth - 1, d)), day: d, inMonth: false });
    }
  }

  return cells;
}
