import { useState } from 'react'
import TodoItem from './components/TodoItem'
import { useTodos } from './hooks/useTodos'
import SearchBar from './components/SearchBar';

function TodoApp() {
  const {
    todos,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    addTodo,
    removeTodo,
    reload
} = useTodos();

    const [newTitle, setNewTitle] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

  const handleDelete = async (id) => {
    try{
      await removeTodo(id);
    }catch{

    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try{
      await addTodo(newTitle);
      setNewTitle('');
    }catch{

    }
  };

  return (
    <div className='app'>
      <h1>Async Todo Mastery</h1>

      <form onSubmit={handleAdd}>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder='Them todo moi'
        />
        <button type='submi'>Them</button>
      </form>

      <SearchBar value={searchTerm} onChange={setSearchTerm}/>


      {loading && <div className='loading'>Dang tai...</div>}

      <div className="todo-list">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onDelete={handleDelete}
          />
        ))}
        {!loading && todos.length === 0 && (
          <p className='empty'>Không có todo nào</p>
        )}
      </div>
    </div>
  )
}

export default TodoApp
