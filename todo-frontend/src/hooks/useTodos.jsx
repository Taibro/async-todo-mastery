import {useState, useEffect, useCallback} from 'react';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../api/todoApi';
import { useDebounce } from './useDebounce';

export function useTodos(){
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    const debouncedSearch = useDebounce(searchTerm, 300);

    const loadTodos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try{
            const {data} = await fetchTodos(debouncedSearch);
            setTodos(data);
        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        loadTodos();
    }, [loadTodos])

    const addTodo = async (title) => {
        if (!title.trim()) return;
        const {data} = await createTodo(title);
        setTodos(prev => [data, ...prev]);
    };

    const removeTodo = async (id) => {
        const previousTodos = useTodos;
        setTodos(prev => prev.filter(t => t.id !== id));
        try{
            await deleteTodo(id);
        }catch{
            setTodos(previousTodos);
            throw new Error('Xoa that bai');
        }
    };

    return {
        todos,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        addTodo,
        removeTodo,
        reload: loadTodos
    };
}