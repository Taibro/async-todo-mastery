import { useState } from 'react'
import TodoItem from './components/TodoItem'
import { useTodos } from './hooks/useTodos'

function TodoApp() {
  const {todos,
    loading,
    addTodo,
    removeTodo,
    reload} = useTodos();

    const [newTitle, setNewTitle] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

  return (
    <div className='app'>
      <h1>Async Todo Mastery</h1>

      <div className="todo-list">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
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
