import { useState, useCallback } from 'react';
import { buildMonthGrid } from '../utils/dateUtils';

export function useCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-based

  const prevMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 1) { setYear((y) => y - 1); return 12; }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 12) { setYear((y) => y + 1); return 1; }
      return m + 1;
    });
  }, []);

  const goToToday = useCallback(() => {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth() + 1);
  }, []);

  const cells = buildMonthGrid(year, month);

  return { year, month, cells, prevMonth, nextMonth, goToToday };
}
