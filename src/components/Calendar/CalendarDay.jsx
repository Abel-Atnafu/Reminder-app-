import { PRIORITY } from '../../constants';
import { isToday } from '../../utils/dateUtils';
import styles from './CalendarDay.module.css';

const MAX_DOTS = 3;

export function CalendarDay({ date, day, inMonth, todos = [], selected, onClick }) {
  const todayMark = inMonth && isToday(date);
  const hasTodos = todos.length > 0;
  const visibleTodos = todos.slice(0, MAX_DOTS);
  const overflow = todos.length - MAX_DOTS;

  return (
    <div
      className={[
        styles.cell,
        inMonth ? styles.inMonth : styles.outMonth,
        todayMark ? styles.today : '',
        selected ? styles.selected : '',
        hasTodos ? styles.hasTodos : '',
      ].join(' ')}
      onClick={() => inMonth && onClick(date)}
      role={inMonth ? 'button' : undefined}
      tabIndex={inMonth ? 0 : undefined}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && inMonth) onClick(date); }}
    >
      <span className={styles.dayNum}>{day}</span>
      {hasTodos && (
        <div className={styles.dots}>
          {visibleTodos.map((t) => (
            <span
              key={t.id}
              className={styles.dot}
              style={{ background: PRIORITY[t.priority]?.color || '#6366f1' }}
              title={t.title}
            />
          ))}
          {overflow > 0 && <span className={styles.overflow}>+{overflow}</span>}
        </div>
      )}
    </div>
  );
}
