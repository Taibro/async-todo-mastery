import { useState } from 'react'
import TodoItem from './components/TodoItem'
import { useTodos } from './hooks/useTodos'
import SearchBar from './components/SearchBar';
import { useToast } from './hooks/useToast';
import { TbReceiptYen } from 'react-icons/tb';
import Toast from './components/Toast';
import BulkAction from './components/BulkActions';

function TodoApp() {
  const {toasts, showToast, removeToast} = useToast();

  const {
    todos,
    loading,
    searchTerm,
    setSearchTerm,
    toggleComplete,
    addTodo,
    removeTodo,
    reload
} = useTodos();

    const [newTitle, setNewTitle] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const handleToggle = async (todo) => {
      try{
        await toggleComplete(todo);
      }catch{
        showToast('Khong the cap nhat', 'error');
      }
    }

  const handleDelete = async (id) => {
    try{
      await removeTodo(id);
      showToast('Da xoa todo', 'success');
    }catch{
      showToast('Xoa that bai', 'error');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try{
      await addTodo(newTitle);
      setNewTitle('');
      showToast('Da them todo!', 'success');
    }catch{
      showToast('Them that bai!', 'error');
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
        <button type='submit'>Them</button>
      </form>

      <SearchBar value={searchTerm} onChange={setSearchTerm}/>

      <BulkAction
        todos={todos}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onComplete={reload}
      />

      {loading && <div className='loading'>Dang tai...</div>}

      <div className="todo-list">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
        {!loading && todos.length === 0 && (
          <p className='empty'>Không có todo nào</p>
        )}
      </div>

      <Toast toasts={toasts} onRemove={removeToast}/>
    </div>
  )
}

export default TodoApp
