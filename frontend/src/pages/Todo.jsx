import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const STATUSES = [
  { value: 'idea', label: 'Idee', emoji: '💡', color: '#9333ea' },
  { value: 'todo', label: 'Todo', emoji: '📋', color: '#3b82f6' },
  { value: 'in_progress', label: 'In Arbeit', emoji: '🔧', color: '#f59e0b' },
  { value: 'done', label: 'Erledigt', emoji: '✅', color: '#22c55e' },
  { value: 'discarded', label: 'Verworfen', emoji: '🗑️', color: '#6b7280' }
];

const CREATORS = [
  { value: 'morpheuxx', label: 'Morpheuxx', emoji: '🔴' },
  { value: 'oli', label: 'Oli', emoji: '👤' }
];

function Todo() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: '', status: 'idea', description: '', creator: 'morpheuxx' });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      setTodos(data.todos || []);
    } catch (e) {
      console.error('Failed to fetch todos:', e);
    }
  };

  const createTodo = async () => {
    if (!newTodo.title.trim()) return;
    
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      });
      if (res.ok) {
        setNewTodo({ title: '', status: 'idea', description: '', creator: 'morpheuxx' });
        setShowNew(false);
        fetchTodos();
      }
    } catch (e) {
      console.error('Failed to create todo:', e);
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchTodos();
        if (selectedTodo?.id === id) {
          setSelectedTodo({ ...selectedTodo, ...updates });
        }
      }
    } catch (e) {
      console.error('Failed to update todo:', e);
    }
  };

  const deleteTodo = async (id) => {
    if (!confirm('Wirklich löschen?')) return;
    
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedTodo(null);
        fetchTodos();
      }
    } catch (e) {
      console.error('Failed to delete todo:', e);
    }
  };

  const getStatusInfo = (status) => STATUSES.find(s => s.value === status) || STATUSES[0];
  const getCreatorInfo = (creator) => CREATORS.find(c => c.value === creator) || CREATORS[0];

  const filteredTodos = filter === 'all' 
    ? todos 
    : todos.filter(t => t.status === filter);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="todo-page">
      <header className="page-header">
        <h1>📋 Todo</h1>
        <p>Gemeinsame Ideen und Aufgaben</p>
      </header>

      {/* Filter & New Button */}
      <div className="todo-toolbar">
        <div className="todo-filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Alle ({todos.length})
          </button>
          {STATUSES.map(s => {
            const count = todos.filter(t => t.status === s.value).length;
            return (
              <button 
                key={s.value}
                className={filter === s.value ? 'active' : ''} 
                onClick={() => setFilter(s.value)}
              >
                {s.emoji} {s.label} ({count})
              </button>
            );
          })}
        </div>
        <button className="btn-new" onClick={() => setShowNew(true)}>
          + Neu
        </button>
      </div>

      {/* New Todo Form */}
      {showNew && (
        <div className="todo-form">
          <h3>Neues Todo</h3>
          <input
            type="text"
            placeholder="Titel"
            value={newTodo.title}
            onChange={e => setNewTodo({ ...newTodo, title: e.target.value })}
          />
          <div className="form-row">
            <select 
              value={newTodo.status} 
              onChange={e => setNewTodo({ ...newTodo, status: e.target.value })}
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
              ))}
            </select>
            <select 
              value={newTodo.creator} 
              onChange={e => setNewTodo({ ...newTodo, creator: e.target.value })}
            >
              {CREATORS.map(c => (
                <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Beschreibung (Markdown)"
            value={newTodo.description}
            onChange={e => setNewTodo({ ...newTodo, description: e.target.value })}
            rows={4}
          />
          <div className="form-actions">
            <button onClick={createTodo}>Erstellen</button>
            <button className="btn-cancel" onClick={() => setShowNew(false)}>Abbrechen</button>
          </div>
        </div>
      )}

      {/* Todo List */}
      <div className="todo-layout">
        <div className="todo-list">
          {filteredTodos.map(todo => {
            const statusInfo = getStatusInfo(todo.status);
            const creatorInfo = getCreatorInfo(todo.creator);
            
            return (
              <div 
                key={todo.id} 
                className={`todo-card ${selectedTodo?.id === todo.id ? 'selected' : ''}`}
                onClick={() => { setSelectedTodo(todo); setIsEditing(false); }}
              >
                <div className="todo-status" style={{ backgroundColor: statusInfo.color }}>
                  {statusInfo.emoji}
                </div>
                <div className="todo-info">
                  <h4>{todo.title}</h4>
                  <div className="todo-meta">
                    <span>{creatorInfo.emoji} {creatorInfo.label}</span>
                    <span>•</span>
                    <span>{formatDate(todo.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredTodos.length === 0 && (
            <p className="empty-state">Keine Todos in dieser Kategorie.</p>
          )}
        </div>

        {/* Todo Detail */}
        {selectedTodo && (
          <div className="todo-detail">
            {isEditing ? (
              <div className="todo-edit">
                <input
                  type="text"
                  value={selectedTodo.title}
                  onChange={e => setSelectedTodo({ ...selectedTodo, title: e.target.value })}
                />
                <select 
                  value={selectedTodo.status}
                  onChange={e => setSelectedTodo({ ...selectedTodo, status: e.target.value })}
                >
                  {STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
                  ))}
                </select>
                <textarea
                  value={selectedTodo.description}
                  onChange={e => setSelectedTodo({ ...selectedTodo, description: e.target.value })}
                  rows={10}
                  placeholder="Beschreibung (Markdown)"
                />
                <div className="form-actions">
                  <button onClick={() => {
                    updateTodo(selectedTodo.id, {
                      title: selectedTodo.title,
                      status: selectedTodo.status,
                      description: selectedTodo.description
                    });
                    setIsEditing(false);
                  }}>Speichern</button>
                  <button className="btn-cancel" onClick={() => setIsEditing(false)}>Abbrechen</button>
                </div>
              </div>
            ) : (
              <>
                <div className="detail-header">
                  <span 
                    className="detail-status" 
                    style={{ backgroundColor: getStatusInfo(selectedTodo.status).color }}
                  >
                    {getStatusInfo(selectedTodo.status).emoji} {getStatusInfo(selectedTodo.status).label}
                  </span>
                  <h2>{selectedTodo.title}</h2>
                  <div className="detail-meta">
                    <span>{getCreatorInfo(selectedTodo.creator).emoji} {getCreatorInfo(selectedTodo.creator).label}</span>
                    <span>•</span>
                    <span>Erstellt: {formatDate(selectedTodo.createdAt)}</span>
                    {selectedTodo.updatedAt !== selectedTodo.createdAt && (
                      <>
                        <span>•</span>
                        <span>Aktualisiert: {formatDate(selectedTodo.updatedAt)}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="detail-content">
                  {selectedTodo.description ? (
                    <ReactMarkdown>{selectedTodo.description}</ReactMarkdown>
                  ) : (
                    <p className="no-description">Keine Beschreibung</p>
                  )}
                </div>
                
                <div className="detail-actions">
                  <button onClick={() => setIsEditing(true)}>Bearbeiten</button>
                  <button className="btn-danger" onClick={() => deleteTodo(selectedTodo.id)}>Löschen</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Todo;
