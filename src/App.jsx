import { useState, useCallback } from 'react';
import { useTodos } from './hooks/useTodos';
import { useCalendar } from './hooks/useCalendar';
import { useReminders } from './hooks/useReminders';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { TodoList } from './components/TodoList/TodoList';
import { Calendar } from './components/Calendar/Calendar';
import { Modal } from './components/UI/Modal';
import { TodoForm } from './components/TodoList/TodoForm';
import styles from './App.module.css';

const DEFAULT_FILTERS = { status: 'all', priority: 'all', category: 'all' };

export default function App() {
  const { todos, addTodo, updateTodo, deleteTodo, toggleComplete, getTodosByDate, getFilteredTodos, getCategories } = useTodos();
  const { year, month, cells, prevMonth, nextMonth, goToToday } = useCalendar();
  useReminders(todos);

  const [view, setView] = useState('split');
  const [selectedDate, setSelectedDate] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [modal, setModal] = useState(null); // null | { mode: 'add' | 'edit', todo?: object, initialValues?: object }

  const handleSelectDate = useCallback((date) => {
    setSelectedDate((prev) => (prev === date ? null : date));
  }, []);

  const handleClearDate = useCallback(() => setSelectedDate(null), []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  }, []);

  const handleClearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const openAdd = useCallback(() => {
    setModal({ mode: 'add', initialValues: selectedDate ? { dueDate: selectedDate } : {} });
  }, [selectedDate]);

  const openEdit = useCallback((todo) => {
    setModal({ mode: 'edit', todo });
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const handleFormSubmit = useCallback((fields) => {
    if (modal.mode === 'edit') {
      updateTodo(modal.todo.id, fields);
    } else {
      addTodo(fields);
    }
    closeModal();
  }, [modal, addTodo, updateTodo, closeModal]);

  const filteredTodos = getFilteredTodos({ search, ...filters });

  return (
    <div className={styles.app}>
      <Header view={view} onViewChange={setView} search={search} onSearch={setSearch} />

      <div className={styles.body}>
        <Sidebar
          categories={getCategories()}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <main className={styles.main}>
          {view === 'split' ? (
            <div className={styles.split}>
              <div className={styles.splitList}>
                <TodoList
                  todos={filteredTodos}
                  selectedDate={selectedDate}
                  onClearDate={handleClearDate}
                  onAdd={openAdd}
                  onToggle={toggleComplete}
                  onEdit={openEdit}
                  onDelete={deleteTodo}
                />
              </div>
              <div className={styles.splitCalendar}>
                <Calendar
                  year={year}
                  month={month}
                  cells={cells}
                  selectedDate={selectedDate}
                  getTodosByDate={getTodosByDate}
                  onSelectDate={handleSelectDate}
                  onPrevMonth={prevMonth}
                  onNextMonth={nextMonth}
                  onToday={goToToday}
                />
              </div>
            </div>
          ) : view === 'list' ? (
            <TodoList
              todos={filteredTodos}
              selectedDate={selectedDate}
              onClearDate={handleClearDate}
              onAdd={openAdd}
              onToggle={toggleComplete}
              onEdit={openEdit}
              onDelete={deleteTodo}
            />
          ) : (
            <Calendar
              year={year}
              month={month}
              cells={cells}
              selectedDate={selectedDate}
              getTodosByDate={getTodosByDate}
              onSelectDate={handleSelectDate}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              onToday={goToToday}
            />
          )}
        </main>
      </div>

      {modal && (
        <Modal
          title={modal.mode === 'edit' ? 'Edit Todo' : 'Add Todo'}
          onClose={closeModal}
        >
          <TodoForm
            initialValues={
              modal.mode === 'edit'
                ? {
                    ...modal.todo,
                    dueDate: modal.todo.dueDate || '',
                    dueTime: modal.todo.dueTime || '',
                  }
                : modal.initialValues || {}
            }
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}
