import { GiSandsOfTime } from "react-icons/gi";
import { SiTicktick } from "react-icons/si";
import { MdCancel } from "react-icons/md";


function TodoItem({ todo, onToggle, onDelete}){
    const syncIndicator = {
        pending: <GiSandsOfTime />,
        synced: <SiTicktick />,
        fail: <MdCancel />,
    }
    
    return (
        <div className={`todo-item ${todo.isCompleted ? 'completed' : ''}`}>
            <input
                type="checkbox"
                checked={todo.isCompleted}
                onChange={() => onToggle(todo)}
            />
            <span className="title">{todo.title}</span>

            <span
                className={`sync-badge sync-${todo.syncStatus}`}
                title={`Sync: ${todo.syncStatus}`}
            >
                {syncIndicator[todo.syncStatus] || ''}
            </span>

            <button onClick={() => onDelete(todo.id)}></button>
        </div>
    );
}

export default TodoItem;