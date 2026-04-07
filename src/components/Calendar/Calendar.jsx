import { CalendarDay } from './CalendarDay';
import { Button } from '../UI/Button';
import { DAYS_OF_WEEK, MONTHS } from '../../constants';
import styles from './Calendar.module.css';

export function Calendar({ year, month, cells, selectedDate, getTodosByDate, onSelectDate, onPrevMonth, onNextMonth, onToday }) {
  return (
    <div className={styles.calendar}>
      <div className={styles.nav}>
        <Button variant="icon" size="sm" onClick={onPrevMonth} title="Previous month">‹</Button>
        <div className={styles.monthTitle}>
          <span>{MONTHS[month - 1]} {year}</span>
          <Button variant="ghost" size="sm" onClick={onToday}>Today</Button>
        </div>
        <Button variant="icon" size="sm" onClick={onNextMonth} title="Next month">›</Button>
      </div>

      <div className={styles.grid}>
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className={styles.dayLabel}>{d}</div>
        ))}
        {cells.map((cell, i) => {
          const todos = cell.date ? getTodosByDate(cell.date) : [];
          return (
            <CalendarDay
              key={i}
              date={cell.date}
              day={cell.day}
              inMonth={cell.inMonth}
              todos={todos}
              selected={cell.date === selectedDate}
              onClick={onSelectDate}
            />
          );
        })}
      </div>
    </div>
  );
}
