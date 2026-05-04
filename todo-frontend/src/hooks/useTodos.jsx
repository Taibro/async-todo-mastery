import {useState, useEffect, useCallback} from 'react';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../api/todoApi';

export function useTodos(){
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(null);

    const loadTodos = useCallback(async () => {
        setLoading(true);
        
        try{
            const {data} = await fetchTodos();
            setTodos(data);
        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);
        }
    }, []);

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
        addTodo,
        removeTodo,
        reload: loadTodos
    };
}