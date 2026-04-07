import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { loadTodos, saveTodos } from '../utils/storage';

// Map Supabase snake_case row → camelCase todo object used by the UI
function rowToTodo(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    completed: row.completed,
    priority: row.priority,
    category: row.category,
    dueDate: row.due_date ?? null,
    dueTime: row.due_time ?? null,
    reminder: row.reminder,
    reminderMinutes: row.reminder_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Map camelCase todo fields → Supabase snake_case columns
function fieldsToRow(fields) {
  const row = {};
  if (fields.title !== undefined) row.title = fields.title;
  if (fields.description !== undefined) row.description = fields.description;
  if (fields.completed !== undefined) row.completed = fields.completed;
  if (fields.priority !== undefined) row.priority = fields.priority;
  if (fields.category !== undefined) row.category = fields.category;
  if ('dueDate' in fields) row.due_date = fields.dueDate || null;
  if ('dueTime' in fields) row.due_time = fields.dueTime || null;
  if (fields.reminder !== undefined) row.reminder = fields.reminder;
  if (fields.reminderMinutes !== undefined) row.reminder_minutes = fields.reminderMinutes;
  return row;
}

async function migrateLocalStorage(userId) {
  const local = loadTodos();
  if (!local.length) return;
  const rows = local.map((t) => ({
    id: t.id,
    user_id: userId,
    title: t.title || 'Untitled',
    description: t.description || '',
    completed: t.completed ?? false,
    priority: t.priority || 'medium',
    category: t.category || 'General',
    due_date: t.dueDate || null,
    due_time: t.dueTime || null,
    reminder: t.reminder ?? false,
    reminder_minutes: t.reminderMinutes ?? 30,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  }));
  const { error } = await supabase.from('todos').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
  if (!error) {
    saveTodos([]); // clear localStorage after successful migration
  }
}

export function useTodos(userId) {
  const [todos, setTodos] = useState([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const channelRef = useRef(null);

  // Fetch all todos for this user and migrate localStorage if needed
  useEffect(() => {
    if (!userId) {
      setTodos([]);
      setTodosLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setTodosLoading(true);
      // Migrate any existing localStorage todos on first load
      await migrateLocalStorage(userId);

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: true });

      if (!cancelled) {
        if (!error && data) setTodos(data.map(rowToTodo));
        setTodosLoading(false);
      }
    }

    load();

    // Realtime subscription for cross-device sync
    channelRef.current = supabase
      .channel('todos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTodos((prev) => [...prev, rowToTodo(payload.new)]);
          } else if (payload.eventType === 'UPDATE') {
            setTodos((prev) => prev.map((t) => t.id === payload.new.id ? rowToTodo(payload.new) : t));
          } else if (payload.eventType === 'DELETE') {
            setTodos((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId]);

  const addTodo = useCallback(async (fields) => {
    const row = {
      user_id: userId,
      title: fields.title || 'Untitled',
      description: fields.description || '',
      completed: false,
      priority: fields.priority || 'medium',
      category: fields.category || 'General',
      due_date: fields.dueDate || null,
      due_time: fields.dueTime || null,
      reminder: fields.reminder ?? false,
      reminder_minutes: fields.reminderMinutes ?? 30,
    };
    const { data, error } = await supabase.from('todos').insert(row).select().single();
    if (!error && data) {
      // Realtime will also fire, but set locally for instant feedback
      setTodos((prev) => {
        if (prev.some((t) => t.id === data.id)) return prev;
        return [...prev, rowToTodo(data)];
      });
      return rowToTodo(data);
    }
    return null;
  }, [userId]);

  const updateTodo = useCallback(async (id, fields) => {
    const row = { ...fieldsToRow(fields), updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('todos').update(row).eq('id', id).select().single();
    if (!error && data) {
      setTodos((prev) => prev.map((t) => t.id === id ? rowToTodo(data) : t));
    }
  }, []);

  const deleteTodo = useCallback(async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  }, []);

  const toggleComplete = useCallback(async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const { data, error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      setTodos((prev) => prev.map((t) => t.id === id ? rowToTodo(data) : t));
    }
  }, [todos]);

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
    todosLoading,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    getTodosByDate,
    getFilteredTodos,
    getCategories,
  };
}
