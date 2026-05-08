

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5121/api',
  timeout: 15000, 
});

// ── Chaos Mode
api.interceptors.request.use((config) => {
  const chaosEnabled = localStorage.getItem('chaos-mode') === 'true';
  if (chaosEnabled) {
    config.headers['X-Chaos-Mode'] = 'true';
  }
  return config;
});

// ── api

// GET /api/todos?search=abc
export const fetchTodos = (search = '') => {
  const params = search ? { search } : {};
  return api.get('/todos', { params });
};

// POST /api/todos
//  title, date, time, isCompleted 
export const createTodo = ({ title, date, time }) =>
  api.post('/todos', {
    title,
    date: date ?? new Date().toISOString().split('T')[0],
    time: time || '00:00',   // TimeOnly cần value, dùng "00:00" nếu không có
    isCompleted: false,
    isArchived: false,
  });

// PUT /api/todos/:id

export const updateTodo = (id, todo) =>
  api.put(`/todos/${id}`, {
    ...todo,
    time: todo.time || '00:00',
  });

// DELETE /api/todos/:id
export const deleteTodo = (id) =>
  api.delete(`/todos/${id}`);

// POST /api/todos/bulk
export const bulkAction = (ids, action) =>
  api.post('/todos/bulk', { ids, action });