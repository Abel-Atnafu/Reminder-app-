import styles from './Header.module.css';

export function Header({ view, onViewChange, search, onSearch, userEmail, onSignOut, todosLoading }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo}>📋</span>
        <h1 className={styles.name}>RemindMe</h1>
        {todosLoading && <span className={styles.syncDot} title="Syncing…" />}
      </div>

      <div className={styles.search}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search todos..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearBtn} onClick={() => onSearch('')}>✕</button>
        )}
      </div>

      <div className={styles.viewToggle}>
        <button
          className={view === 'list' ? styles.active : ''}
          onClick={() => onViewChange('list')}
          title="List view"
        >
          ≡ List
        </button>
        <button
          className={view === 'calendar' ? styles.active : ''}
          onClick={() => onViewChange('calendar')}
          title="Calendar view"
        >
          📅 Calendar
        </button>
        <button
          className={view === 'split' ? styles.active : ''}
          onClick={() => onViewChange('split')}
          title="Split view"
        >
          ⊞ Split
        </button>
      </div>

      <div className={styles.user}>
        <span className={styles.userEmail} title={userEmail}>{userEmail}</span>
        <button className={styles.signOutBtn} onClick={onSignOut} title="Sign out">
          Sign out
        </button>
      </div>
    </header>
  );
}
