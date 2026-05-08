import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/todoApi';

const TASK_COLORS = ['#c8e8d4','#ddd7f5','#fce4d8','#d5e8f5','#f5e8c8','#e8e8e8','#f0ddf5','#d8f0e8'];

// function getThisWeekDate(dayOfWeek) { // 1=Mon, 2=Tue, ..., 7=Sun
//   const now = new Date();
//   const currentDay = now.getDay(); // 0=Sun, 1=Mon...
//   const monday = new Date(now);
//   monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
//   const target = new Date(monday);
//   target.setDate(monday.getDate() + (dayOfWeek - 1));
//   return target.toISOString().split('T')[0]; // "2026-05-08"
// }

// const SEED = [
//   { id:1,  title:'Design onboarding',        date: getThisWeekDate(1), time:'09:00', isCompleted:false, isArchived:false, syncStatus:'synced', color:'#c8e8d4' },
//   { id:2,  title:'Write hiring criteria',    date: getThisWeekDate(1), time:'10:02', isCompleted:true,  isArchived:false, syncStatus:'synced', color:'#e8e8e8' },
//   { id:3,  title:'Weekly design review',     date: getThisWeekDate(2), time:'10:02', isCompleted:false, isArchived:false, syncStatus:'synced', color:'#ddd7f5' },

export function useTodos(showToast) {
  const [todos, setTodos]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null);

  // load tu api
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.fetchTodos();
        setTodos(data.map(t => ({
          ...t,
          syncStatus: 'synced',
          color: t.color ?? TASK_COLORS[t.id % TASK_COLORS.length],
          date: t.date ? t.date.split('T')[0] : null,
          time: t.time ? t.time.substring(0, 5) : '',
        })));
      } catch {
        console.warn('API unavailable, using seed data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addTodo = useCallback(async ({ title, date, time, color }) => {
    const tempId = Date.now();
    const temp = {
      id: tempId, title,
      date: date ?? new Date().toISOString().split('T')[0],
      time: time ?? '',
      isCompleted: false, isArchived: false,
      syncStatus: 'pending',
      color: color ?? TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)],
    };


    setTodos(ts => [temp, ...ts]);

    try {
      const { data } = await api.createTodo({ title, date, time });
      setTodos(ts => ts.map(t => t.id === tempId
        ? {
            ...data,
            syncStatus: 'synced',
            color: temp.color,
            date: data.date ? data.date.split('T')[0] : temp.date,
            time: data.time ? data.time.substring(0, 5) : temp.time,
          }
        : t
      ));
      showToast('Task added', 'success');
    } catch {
      setTodos(ts => ts.filter(t => t.id !== tempId)); // rollback
      showToast('Failed to add task', 'error');
    }
  }, [showToast]);

  const toggleComplete = useCallback(async (todo) => {
    const snapshot = todos.slice(); 

    setTodos(ts => ts.map(t =>
      t.id === todo.id ? { ...t, isCompleted: !t.isCompleted, syncStatus: 'pending' } : t
    ));

    try {
      await api.updateTodo(todo.id, { ...todo, isCompleted: !todo.isCompleted });
      setTodos(ts => ts.map(t =>
        t.id === todo.id ? { ...t, syncStatus: 'synced' } : t
      ));
    } catch {
      setTodos(snapshot); 
      showToast('Update failed — reverted', 'error');
    }
  }, [todos, showToast]);

  const deleteTodo = useCallback(async (id) => {
    const snapshot = todos.slice();
    setTodos(ts => ts.filter(t => t.id !== id)); 
    try {
      await api.deleteTodo(id);
    } catch {
      setTodos(snapshot); 
      showToast('Delete failed', 'error');
    }
  }, [todos, showToast]);

  const bulkDelete = useCallback(async (ids) => {
    if (!ids.length) return;
    const total = ids.length;
    let done = 0;
    setBulkProgress(0);

    // Promise.all
    await Promise.all(ids.map(async (id) => {
      try {
        await api.deleteTodo(id);
        setTodos(ts => ts.filter(t => t.id !== id));
      } catch {
        
      }
      done++;
      setBulkProgress(Math.round((done / total) * 100));
    }));

    setBulkProgress(null);
    showToast(`Deleted ${total} tasks`, 'success');
  }, [showToast]);

  return { todos, loading, bulkProgress, addTodo, toggleComplete, deleteTodo, bulkDelete };
}