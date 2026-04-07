import { useState } from 'react';
import { DEFAULT_CATEGORIES } from '../../constants';
import { Button } from '../UI/Button';
import styles from './TodoForm.module.css';

const EMPTY = {
  title: '',
  description: '',
  priority: 'medium',
  category: 'General',
  dueDate: '',
  dueTime: '',
  reminder: false,
  reminderMinutes: 30,
};

export function TodoForm({ initialValues = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...initialValues });
  const [error, setError] = useState('');

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (form.dueTime && !form.dueDate) { setError('A due date is required when setting a time.'); return; }
    setError('');
    onSubmit({
      ...form,
      title: form.title.trim(),
      dueDate: form.dueDate || null,
      dueTime: form.dueTime || null,
      reminderMinutes: Number(form.reminderMinutes),
    });
  };

  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...(form.category ? [form.category] : [])]));

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.field}>
        <label>Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="What needs to be done?"
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Add details..."
          rows={3}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Priority</label>
          <select value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className={styles.field}>
          <label>Category</label>
          <input
            list="categories"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            placeholder="e.g. Work"
          />
          <datalist id="categories">
            {allCategories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Due Date</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label>Due Time</label>
          <input
            type="time"
            value={form.dueTime}
            onChange={(e) => set('dueTime', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.reminderRow}>
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={form.reminder}
            onChange={(e) => set('reminder', e.target.checked)}
          />
          Enable reminder notification
        </label>
        {form.reminder && (
          <div className={styles.field}>
            <label>Remind me</label>
            <select
              value={form.reminderMinutes}
              onChange={(e) => set('reminderMinutes', e.target.value)}
            >
              <option value={5}>5 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
              <option value={120}>2 hours before</option>
              <option value={1440}>1 day before</option>
            </select>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary">Save Todo</Button>
      </div>
    </form>
  );
}
