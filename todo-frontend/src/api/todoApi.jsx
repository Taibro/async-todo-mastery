import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5121/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, 
});


// api function
export const fetchTodos = (search = '') => {
    const params = search ? {search} : {};
    return api.get('/todos', {params});
};

export const createTodo = (title) => 
    api.post('/todos', {title, isCompleted: false});

export const updateTodo = (id, data) =>
    api.put(`/todos/${id}`, data);

export const deleteTodo = (id) =>
    api.delete(`/todos/${id}`);

export const bulkAction = (ids, action) =>
    api.post('/todos/bulk', {ids, action});