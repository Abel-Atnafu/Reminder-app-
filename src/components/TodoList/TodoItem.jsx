import { useState } from 'react';
import { PriorityBadge, CategoryBadge } from '../UI/Badge';
import { Button } from '../UI/Button';
import { toDisplayDate, toDisplayTime, isPastDue } from '../../utils/dateUtils';
import { PRIORITY } from '../../constants';
import styles from './TodoItem.module.css';

export function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const overdue = !todo.completed && isPastDue(todo.dueDate, todo.dueTime);

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(todo.id);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <div className={`${styles.item} ${todo.completed ? styles.completed : ''}`}>
      <div className={styles.left}>
        <button
          className={`${styles.checkbox} ${todo.completed ? styles.checked : ''}`}
          onClick={() => onToggle(todo.id)}
          aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
          style={todo.completed ? { background: PRIORITY[todo.priority]?.color } : {}}
        >
          {todo.completed && '✓'}
        </button>
      </div>

      <div className={styles.content}>
        <p className={styles.title}>{todo.title}</p>
        {todo.description && <p className={styles.desc}>{todo.description}</p>}
        <div className={styles.meta}>
          <PriorityBadge priority={todo.priority} />
          <CategoryBadge category={todo.category} />
          {todo.dueDate && (
            <span className={`${styles.due} ${overdue ? styles.overdue : ''}`}>
              {overdue ? '⚠ ' : '📅 '}
              {toDisplayDate(todo.dueDate)}
              {todo.dueTime && ` at ${toDisplayTime(todo.dueTime)}`}
            </span>
          )}
          {todo.reminder && todo.dueTime && (
            <span className={styles.reminder}>🔔 {todo.reminderMinutes}m before</span>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="icon" size="sm" onClick={() => onEdit(todo)} title="Edit">✏</Button>
        <Button
          variant="icon"
          size="sm"
          onClick={handleDelete}
          onBlur={() => setConfirmDelete(false)}
          title={confirmDelete ? 'Click again to confirm' : 'Delete'}
          className={confirmDelete ? styles.dangerConfirm : ''}
        >
          {confirmDelete ? 'Sure?' : '🗑'}
        </Button>
      </div>
    </div>
  );
}
