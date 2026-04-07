import { PRIORITY } from '../../constants';
import styles from './Badge.module.css';

export function PriorityBadge({ priority }) {
  const config = PRIORITY[priority] || PRIORITY.medium;
  return (
    <span
      className={styles.badge}
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}

export function CategoryBadge({ category }) {
  return <span className={styles.category}>{category}</span>;
}
