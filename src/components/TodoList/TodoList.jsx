import { TodoItem } from './TodoItem';
import { Button } from '../UI/Button';
import { EmptyState } from '../UI/EmptyState';
import { toDisplayDate } from '../../utils/dateUtils';
import styles from './TodoList.module.css';

function sortTodos(todos) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const pa = priorityOrder[a.priority] ?? 1;
    const pb = priorityOrder[b.priority] ?? 1;
    if (pa !== pb) return pa - pb;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
}

export function TodoList({
  todos,
  selectedDate,
  onClearDate,
  onAdd,
  onToggle,
  onEdit,
  onDelete,
}) {
  const filtered = selectedDate
    ? todos.filter((t) => t.dueDate === selectedDate)
    : todos;

  const sorted = sortTodos(filtered);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>
            {selectedDate ? (
              <>
                {toDisplayDate(selectedDate)}
                <button className={styles.clearDate} onClick={onClearDate} title="Show all todos">✕</button>
              </>
            ) : (
              'All Todos'
            )}
          </h2>
          <span className={styles.count}>{sorted.length}</span>
        </div>
        <Button variant="primary" size="sm" onClick={onAdd}>+ Add Todo</Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={selectedDate ? '📅' : '✅'}
          message={selectedDate ? 'No todos for this date' : 'No todos yet'}
          subMessage={selectedDate ? 'Add one below or pick another date' : 'Click + Add Todo to get started'}
          action={<Button variant="ghost" size="sm" onClick={onAdd}>+ Add Todo</Button>}
        />
      ) : (
        <div className={styles.list}>
          {sorted.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
