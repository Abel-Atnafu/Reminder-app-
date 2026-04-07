import { useState, useCallback } from 'react';
import { buildMonthGrid } from '../utils/dateUtils';

export function useCalendar() {
  const now = new Date();
  const [cal, setCal] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1, // 1-based
  });

  const prevMonth = useCallback(() => {
    setCal(({ year, month }) => {
      if (month === 1) return { year: year - 1, month: 12 };
      return { year, month: month - 1 };
    });
  }, []);

  const nextMonth = useCallback(() => {
    setCal(({ year, month }) => {
      if (month === 12) return { year: year + 1, month: 1 };
      return { year, month: month + 1 };
    });
  }, []);

  const goToToday = useCallback(() => {
    const n = new Date();
    setCal({ year: n.getFullYear(), month: n.getMonth() + 1 });
  }, []);

  const cells = buildMonthGrid(cal.year, cal.month);

  return { year: cal.year, month: cal.month, cells, prevMonth, nextMonth, goToToday };
}
