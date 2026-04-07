import styles from './EmptyState.module.css';

export function EmptyState({ icon = '📋', message, subMessage, action }) {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>{icon}</div>
      <p className={styles.message}>{message}</p>
      {subMessage && <p className={styles.sub}>{subMessage}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
