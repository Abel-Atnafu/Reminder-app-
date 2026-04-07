import { DEFAULT_CATEGORIES } from '../../constants';
import styles from './Sidebar.module.css';

export function Sidebar({ categories, filters, onFilterChange, onClearFilters }) {
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...categories]));
  const hasFilters = filters.category !== 'all' || filters.priority !== 'all' || filters.status !== 'all';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <h3 className={styles.heading}>Status</h3>
        {['all', 'active', 'completed'].map((s) => (
          <button
            key={s}
            className={`${styles.filterBtn} ${filters.status === s ? styles.active : ''}`}
            onClick={() => onFilterChange('status', s)}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>Priority</h3>
        {[['all', 'All'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([val, label]) => (
          <button
            key={val}
            className={`${styles.filterBtn} ${filters.priority === val ? styles.active : ''}`}
            onClick={() => onFilterChange('priority', val)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>Category</h3>
        <button
          className={`${styles.filterBtn} ${filters.category === 'all' ? styles.active : ''}`}
          onClick={() => onFilterChange('category', 'all')}
        >
          All
        </button>
        {allCategories.map((c) => (
          <button
            key={c}
            className={`${styles.filterBtn} ${filters.category === c ? styles.active : ''}`}
            onClick={() => onFilterChange('category', c)}
          >
            {c}
          </button>
        ))}
      </div>

      {hasFilters && (
        <button className={styles.clear} onClick={onClearFilters}>
          Clear filters
        </button>
      )}
    </aside>
  );
}
