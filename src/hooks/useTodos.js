import { useState, useCallback } from 'react';
import { loadTodos, saveTodos } from '../utils/storage';

function createTodo(fields) {
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    completed: false,
    priority: 'medium',
    category: 'General',
    dueDate: null,
    dueTime: null,
    reminder: false,
    reminderMinutes: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...fields,
  };
}

export function useTodos() {
  const [todos, setTodos] = useState(() => loadTodos());

  const persist = useCallback((updated) => {
    setTodos(updated);
    saveTodos(updated);
  }, []);

  const addTodo = useCallback((fields) => {
    const todo = createTodo(fields);
    persist((prev) => [...prev, todo]);
    return todo;
  }, [persist]);

  const updateTodo = useCallback((id, fields) => {
    persist((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...fields, updatedAt: new Date().toISOString() } : t
      )
    );
  }, [persist]);

  const deleteTodo = useCallback((id) => {
    persist((prev) => prev.filter((t) => t.id !== id));
  }, [persist]);

  const toggleComplete = useCallback((id) => {
    persist((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() }
          : t
      )
    );
  }, [persist]);

  const getTodosByDate = useCallback(
    (isoDate) => todos.filter((t) => t.dueDate === isoDate),
    [todos]
  );

  const getFilteredTodos = useCallback(
    ({ search = '', category = 'all', priority = 'all', status = 'all', date = null }) => {
      return todos.filter((t) => {
        if (date && t.dueDate !== date) return false;
        if (status === 'active' && t.completed) return false;
        if (status === 'completed' && !t.completed) return false;
        if (priority !== 'all' && t.priority !== priority) return false;
        if (category !== 'all' && t.category !== category) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q))
            return false;
        }
        return true;
      });
    },
    [todos]
  );

  const getCategories = useCallback(() => {
    const cats = new Set(todos.map((t) => t.category).filter(Boolean));
    return Array.from(cats);
  }, [todos]);

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    getTodosByDate,
    getFilteredTodos,
    getCategories,
  };
}
