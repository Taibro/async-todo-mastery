import { useState, useCallback } from 'react';
import { ChaosProvider, useChaos } from './context/ChaosContext';
import { useTodos } from './hooks/useTodos';
import { useDebounce } from './hooks/useDebounce';
import { useToast } from './hooks/useToast';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import './App.css';


const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
const DAY_NAMES = { mon:'Mon', tue:'Tue', wed:'Wed', thu:'Thu', fri:'Fri', sat:'Sat', sun:'Sun' };
const TASK_COLORS = ['#c8e8d4','#ddd7f5','#fce4d8','#d5e8f5','#f5e8c8','#e8e8e8','#f0ddf5','#d8f0e8'];

function getWeekDates(offset = 0) {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); 

  const monday = new Date(now);
  monday.setDate(now.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));

  monday.setDate(monday.getDate() + offset * 7);

  return DAYS.map((dayKey, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    return {
      key: dayKey,
      num: date.getDate(),
      name: DAY_NAMES[dayKey],
      isToday: date.toDateString() === new Date().toDateString(),
      fullDate: date,                           
      dateStr: date.toISOString().split('T')[0], 
    };
  });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getHeaderLabel(weekDates) {
  const first = weekDates[0].fullDate;
  const last  = weekDates[6].fullDate;
  const year  = first.getFullYear();
  const weekNum = getWeekNumber(first);

  const label = first.getMonth() !== last.getMonth()
    ? `${first.toLocaleString('default',{month:'short'})} – ${last.toLocaleString('default',{month:'short'})} ${year}`
    : `${first.toLocaleString('default',{month:'long'})} ${year}`;

  return { label, weekNum };
}

// --------------------------------------------

export default function App() {
  return (
    <ChaosProvider>
      <TodoApp />
    </ChaosProvider>
  );
}

// ── Main App
function TodoApp() {
  const { chaosEnabled, toggleChaos } = useChaos();
  const { toasts, showToast }         = useToast();
  const {
    todos, addTodo, toggleComplete, deleteTodo, bulkDelete, bulkProgress,
  } = useTodos(showToast);

  // ── State
  const [search, setSearch]           = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [weekOffset, setWeekOffset]   = useState(0); 
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDate, setNewTodoDate] = useState(''); 
  const [newTodoTime, setNewTodoTime] = useState(''); 
  const [showDateRow, setShowDateRow] = useState(false);

  const debouncedSearch    = useDebounce(search, 300);
  const isSearchDebouncing = search !== debouncedSearch;

  const weekDates = getWeekDates(weekOffset);
  const { label: headerLabel, weekNum } = getHeaderLabel(weekDates);

  const visibleTodos = todos.filter(t => {
    if (t.isArchived) return false;
    if (debouncedSearch && !t.title.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    return true;
  });

  const weekTodos = visibleTodos.filter(t => {
    if (!t.date) return false;
  
    const [y, mo, d] = t.date.split('T')[0].split('-').map(Number);
    const taskDate = new Date(y, mo - 1, d);
  
    const weekStart = weekDates[0].fullDate; // Thứ 2
    const weekEnd   = weekDates[6].fullDate; // Chủ nhật
  
    return taskDate >= new Date(weekStart.toDateString())
        && taskDate <= new Date(weekEnd.toDateString());
  });

  const todosForDay = (weekDay) =>
    visibleTodos.filter(t => {
      if (!t.date) return false;

      const [y, mo, d] = t.date.split('T')[0].split('-').map(Number);
      const taskDate = new Date(y, mo - 1, d); // local date, không UTC
      return taskDate.toDateString() === weekDay.fullDate.toDateString();
    });

  const allVisIds = visibleTodos.map(t => t.id);

  const toggleSelect = useCallback((id) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  }, []);

  const handleInputFocus = () => {
    setShowDateRow(true);
    if (!newTodoDate) setNewTodoDate(weekDates[0].dateStr);
  };

  const handleEmptyDayClick = (wd) => {
    setNewTodoDate(wd.dateStr);
    setShowDateRow(true);
    // Scroll lên và focus input
    document.querySelector('.add-input')?.focus();
  };

  const handleAddTodo = useCallback(async (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    const color = TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)];
    
    const date = newTodoDate || new Date().toISOString().split('T')[0];
    const time = newTodoTime || '';

    await addTodo({ title: newTodoText.trim(), date, time, color });

    setNewTodoText('');
    setNewTodoDate('');
    setNewTodoTime('');
    setShowDateRow(false);
  }, [newTodoText, newTodoDate, newTodoTime, addTodo]);

  const handleBulkDelete = async () => {
    await bulkDelete(selectedIds);
    setSelectedIds([]);
  };

  const handleChaosToggle = () => {
    toggleChaos();
    showToast(
      chaosEnabled ? 'Chaos mode disabled' : 'Chaos ON: 3s delay + 20% failure',
      chaosEnabled ? 'info' : 'error'
    );
  };

  return (
    <div className="app">
      <IconStrip />

      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">Todos</span>
        </div>
        <div className="sidebar-scroll">
          <SidebarGroup
            todos={weekTodos}
            weekDates={weekDates}
            onToggleComplete={toggleComplete}
          />
        </div>
      </aside>

      <main className="main">
        {chaosEnabled && (
          <div className="chaos-banner">
            CHAOS MODE — 3s delay + 20% failure rate
          </div>
        )}

        {/* Top bar */}
        <div className="main-topbar">
          <span className="main-title">{headerLabel}</span>
          <div className="week-nav">
            <span className="week-label"> / W{weekNum}</span>

            <button
              className="nav-btn"
              onClick={() => setWeekOffset(o => o - 1)}
              title="Tuần trước"
            >
              <FaArrowLeft />
            </button>
            <button
              className="nav-btn"
              onClick={() => setWeekOffset(o => o + 1)}
              title="Tuần sau"
            >
              <FaArrowRight />
            </button>
          </div>

          <div className="main-actions">
            <div className="search-wrap">
              <input
                className="search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tasks..."
              />
              {isSearchDebouncing && <div className="search-dot" />}
            </div>

            <button className="today-btn" onClick={() => setWeekOffset(0)}>Today</button>

            <button
              className={`chaos-btn ${chaosEnabled ? 'on' : 'off'}`}
              onClick={handleChaosToggle}
            >
              {chaosEnabled ? ' Chaos ON' : 'Chaos Mode'}
            </button>
          </div>
        </div>

        {visibleTodos.length > 0 && (
          <div className="select-bar">
            <input
              type="checkbox"
              className="select-all-cb"
              checked={selectedIds.length === allVisIds.length && allVisIds.length > 0}
              onChange={e => setSelectedIds(e.target.checked ? allVisIds : [])}
            />
            <span className="select-info">
              {selectedIds.length > 0 ? `${selectedIds.length} selected` : `${visibleTodos.length} tasks`}
            </span>
            {selectedIds.length > 0 && (
              <button className="del-sel-btn" onClick={handleBulkDelete}>
                Delete {selectedIds.length}
              </button>
            )}
          </div>
        )}

        {bulkProgress !== null && (
          <div className="bulk-bar">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${bulkProgress}%` }} />
            </div>
            <span className="bulk-text">Deleting... {bulkProgress}%</span>
          </div>
        )}

        <form className="add-form" onSubmit={handleAddTodo}>
          
          <div className="add-row-main">
            <input
              className="add-input"
              value={newTodoText}
              onChange={e => setNewTodoText(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="Add task to This week..."
            />
            <button type="submit" className="add-btn">Add</button>
          </div>

          {showDateRow && (
            <div className="add-row-datetime">
              
              <label className="datetime-label">Date</label>
              <input
                type="date"
                className="date-input"
                value={newTodoDate}
                onChange={e => setNewTodoDate(e.target.value)}
              />

              
              <label className="datetime-label">Time</label>
              <input
                type="time"
                className="time-input"
                value={newTodoTime}
                onChange={e => setNewTodoTime(e.target.value)}
              />

              <span className="week-range-hint">
                {weekDates[0].fullDate.toLocaleDateString('en',{month:'short',day:'numeric'})}
                {' – '}
                {weekDates[6].fullDate.toLocaleDateString('en',{month:'short',day:'numeric'})}
              </span>

              <button
                type="button"
                className="dismiss-btn"
                onClick={() => { setShowDateRow(false); setNewTodoText(''); setNewTodoDate(''); setNewTodoTime(''); }}
              >
                Cancel
              </button>
            </div>
          )}
        </form>

        <div className="week-view">
          <div className="week-columns">
            {/* Cột giờ */}
            <div className="time-col">
              {['9 am','10 am','11 am','noon','1 pm','2 pm','3 pm','4 pm','5 pm','6 pm'].map(t => (
                <div key={t} className="time-slot">
                  <span className="time-label">{t}</span>
                </div>
              ))}
            </div>

            {weekDates.map(wd => (
              <div key={wd.key} className="day-col">
                <div className="day-header">
                  <div className={`day-num ${wd.isToday ? 'today' : ''}`}>{wd.num}</div>
                  <div className="day-name">{wd.name}</div>
                </div>
                <div className="day-tasks">
                  {todosForDay(wd).length === 0 ? (
                    <div
                      className="empty-day-click"
                      onClick={() => handleEmptyDayClick(wd)}
                      title={`Add task on ${wd.fullDate.toLocaleDateString()}`}
                    />
                  ) : (
                    todosForDay(wd).map(todo => (
                      <TaskCard
                        key={todo.id}
                        todo={todo}
                        isSelected={selectedIds.includes(todo.id)}
                        onSelect={() => toggleSelect(todo.id)}
                        onToggle={() => toggleComplete(todo)}
                        onDelete={() => deleteTodo(todo.id)}
                        formatTime={formatTime}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
        ))}
      </div>
    </div>
  );
}


function IconStrip() {
  return (
    <div className="icon-strip">
      <div className="icon-dot-grid">
        {['#9f7cdf','#7cb9df','#dfb87c','#7cdf9f'].map(bg => (
          <div key={bg} className="dot" style={{ background: bg }} />
        ))}
      </div>
      <div className="badge">8</div>
    </div>
  );
}

function SidebarGroup({ todos, weekDates, onToggleComplete }) {
  const rangeLabel = weekDates
    ? `${weekDates[0].fullDate.toLocaleDateString('en',{ month:'short', day:'numeric' })} – ${weekDates[6].num}`
    : 'This week';

  return (
    <div>
      <div className="group-header">
        <span className="group-label">This week</span>

        <span className="group-week-range">{rangeLabel}</span>
        <button className="group-toggle">–</button>
      </div>

      <div className="sb-week-count">{todos.length} tasks</div>

      {todos.slice(0, 8).map(todo => (
        <div key={todo.id} className="sb-todo">
          <div
            className={`sb-cb ${todo.isCompleted ? 'checked' : ''}`}
            onClick={() => onToggleComplete(todo)}
          >
            {todo.isCompleted && <span className="sb-cb-check">✓</span>}
          </div>
          <div style={{ flex: 1 }}>
            <span className={`sb-todo-text ${todo.isCompleted ? 'done' : ''}`}>
              {todo.title}
            </span>
           
            {todo.date && (
              <span className="sb-todo-date">
                {new Date(todo.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>

          <div className={`sb-todo-sync sync-${todo.syncStatus}`} />
        </div>
      ))}
      <div className="sb-add"><span>+ Todo</span></div>
    </div>
  );
}

function TaskCard({ todo, isSelected, onSelect, onToggle, onDelete, formatTime }) {
  return (
    <div
      className={`task-card ${isSelected ? 'selected' : ''} ${todo.isCompleted ? 'completed' : ''}`}
      style={{ background: todo.color }}
      onClick={onSelect}
    >
      <div
        className={`task-cb ${todo.isCompleted ? 'checked' : ''}`}
        onClick={e => { e.stopPropagation(); onToggle(); }}
      >
        {todo.isCompleted && <span className="task-cb-check">✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div className={`task-title ${todo.isCompleted ? 'done' : ''}`}>{todo.title}</div>
        {todo.time && <div className="task-time">{formatTime(todo.time)}</div>}
      </div>
      <button className="task-del" onClick={e => { e.stopPropagation(); onDelete(); }}>×</button>
      <div
        className="task-sync"
        style={{
          background: todo.syncStatus==='pending' ? '#f59e0b'
            : todo.syncStatus==='failed' ? '#ef4444' : 'transparent',
        }}
      />
    </div>
  );
}