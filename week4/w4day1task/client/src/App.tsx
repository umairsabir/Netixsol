import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Check, 
  Trash2, 
  Plus, 
  User, 
  Briefcase, 
  ShoppingCart, 
  ChevronRight,
  Sparkles,
  Bell,
  CheckCircle2,
  Circle,
  Sun,
  Moon,
  Pencil,
  X,
  Save,
  Menu
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  category: string;
  isCompleted: boolean;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/tasks';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Persist Active Category
  const [activeCategory, setActiveCategory] = useState(() => {
    return localStorage.getItem('todo_active_category') || 'Personal';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  // Edit State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('todo_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((cat: any) => ({
            ...cat,
            icon: cat.name === 'Personal' ? <User size={18} /> : 
                  cat.name === 'Work' ? <Briefcase size={18} /> :
                  cat.name === 'Shopping' ? <ShoppingCart size={18} /> : <Circle size={18} />
          }));
        }
      } catch (e) {
        console.error('Failed to parse categories', e);
      }
    }
    return [
      { name: 'Personal', icon: <User size={18} /> },
      { name: 'Work', icon: <Briefcase size={18} /> },
      { name: 'Shopping', icon: <ShoppingCart size={18} /> }
    ];
  });

  // Sync Categories to LocalStorage
  useEffect(() => {
    const catsToSave = categories.map(c => ({ name: c.name }));
    localStorage.setItem('todo_categories', JSON.stringify(catsToSave));
  }, [categories]);

  // Sync Active Category to LocalStorage
  useEffect(() => {
    localStorage.setItem('todo_active_category', activeCategory);
  }, [activeCategory]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchTasks();
    document.body.className = isDarkMode ? '' : 'light-theme';
  }, []);

  useEffect(() => {
    document.body.className = isDarkMode ? '' : 'light-theme';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get<Task[]>(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      const response = await axios.post<Task>(API_URL, { 
        title: inputValue,
        category: activeCategory 
      });
      setTasks([response.data, ...tasks]);
      setInputValue('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      const response = await axios.put<Task>(`${API_URL}/${id}`, { isCompleted: !currentStatus });
      setTasks(tasks.map(t => t.id === id ? response.data : t));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingValue(task.title);
  };

  const saveEdit = async (id: string) => {
    if (!editingValue.trim()) return;
    try {
      const response = await axios.put<Task>(`${API_URL}/${id}`, { title: editingValue });
      setTasks(tasks.map(t => t.id === id ? response.data : t));
      setEditingTaskId(null);
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      setIsAddingCategory(false);
      return;
    }

    const exists = categories.find(c => c.name.toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
      setIsAddingCategory(false);
      setNewCategoryName('');
      return;
    }

    setCategories(prev => [
      ...prev,
      { name: trimmedName, icon: <Circle size={18} /> }
    ]);
    setActiveCategory(trimmedName);
    setNewCategoryName('');
    setIsAddingCategory(false);
    setIsSidebarOpen(false);
  };

  const handleDeleteCategory = (name: string) => {
    if (['Personal', 'Work', 'Shopping'].includes(name)) return;

    setCategories(prev => prev.filter(c => c.name !== name));
    if (activeCategory === name) {
      setActiveCategory('Personal');
    }
  };

  const filteredTasks = tasks.filter(t => t.category === activeCategory);
  const completedCount = filteredTasks.filter(t => t.isCompleted).length;
  const pendingCount = filteredTasks.length - completedCount;
  const completionRate = filteredTasks.length > 0 ? Math.round((completedCount / filteredTasks.length) * 100) : 0;


  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Sidebar Overlay */}
      <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header-mobile">
           <span className="logo-text">Menu</span>
           <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>
             <X size={20} />
           </button>
        </div>
        <div className="logo-section">
          <div className="logo-icon">
            <Check size={24} color="white" strokeWidth={3} />
          </div>
          <span className="logo-text">TodoApp</span>
        </div>

        <div className="nav-label">
          <span>MY LISTS</span>
          <div 
            onClick={() => setIsAddingCategory(true)}
            style={{ 
              cursor: 'pointer', 
              padding: '4px', 
              display: 'flex', 
              alignItems: 'center', 
              background: 'var(--bg-accent)', 
              borderRadius: '6px',
              color: 'var(--text-primary)'
            }}
          >
            <Plus size={16} />
          </div>
        </div>

        <div className="nav-list">
          {categories.map(cat => (
            <div 
              key={cat.name}
              className={`nav-item ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat.name);
                setIsSidebarOpen(false);
              }}
              style={{ position: 'relative' }}
            >
              {cat.icon}
              <span style={{ flex: 1 }}>{cat.name}</span>
              
              {!['Personal', 'Work', 'Shopping'].includes(cat.name) && (
                <button 
                  className="delete-cat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(cat.name);
                  }}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}

          {isAddingCategory && (
            <form onSubmit={handleAddCategory} className="nav-item adding">
              <Circle size={18} />
              <input 
                autoFocus
                className="category-input"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onBlur={() => !newCategoryName && setIsAddingCategory(false)}
                placeholder="List name..."
              />
            </form>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="header-top">
          <div className="header-left-group">
            <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div>
              <div className="breadcrumbs">
                LISTS <ChevronRight size={14} /> <span>{activeCategory}</span>
              </div>
              <h1 className="page-title">{activeCategory}</h1>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div 
              className="stat-icon-wrapper" 
              onClick={() => alert('This feature is under working')}
            >
              <Bell size={20} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card completion-card">
            <div style={{ marginBottom: '10px' }}>
              <span className="completion-label" style={{ display: 'block', marginBottom: '2px' }}>COMPLETION</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, opacity: 0.8 }}>
                of goals achieved
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
              <span className="completion-value-mini">{completionRate}%</span>
            </div>

            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${completionRate}%` }}></div>
            </div>
          </div>

          <div className="stat-card simple-card">
            <div className="stat-header-row">
              <div className="stat-icon-mini" style={{ color: '#10b981' }}>
                <CheckCircle2 size={18} />
              </div>
              <span className="completion-label">COMPLETE</span>
            </div>
            <span className="stat-num">{completedCount}</span>
          </div>

          <div className="stat-card simple-card">
            <div className="stat-header-row">
              <div className="stat-icon-mini">
                <div className="orbital-spinner mini"></div>
              </div>
              <span className="completion-label">PENDING</span>
            </div>
            <span className="stat-num">{pendingCount}</span>
          </div>
        </div>

        {/* Input Section */}
        <form className="input-section" onSubmit={addTask}>
          <div className="input-wrapper">
            <Plus size={20} className="input-icon-left" />
            <input 
              type="text" 
              placeholder={`Add to ${activeCategory}...`} 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-add">
            <span>Add Task</span>
            <Sparkles size={16} />
          </button>
        </form>

        {/* List Section */}
        <div className="task-list">
          {loading ? (
            <p style={{ textAlign: 'center', opacity: 0.5 }}>Loading your tasks...</p>
          ) : filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.3 }}>
              <Sparkles size={64} style={{ marginBottom: '1rem', color: 'var(--text-primary)' }} />
              <p style={{ color: 'var(--text-primary)' }}>No tasks in {activeCategory} yet.</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="task-item">
                <div 
                  className={`task-circle ${task.isCompleted ? 'completed' : ''}`}
                  onClick={() => toggleComplete(task.id, task.isCompleted)}
                >
                  {task.isCompleted && <Check size={14} color="white" strokeWidth={3} />}
                </div>
                <div className="task-info">
                  {editingTaskId === task.id ? (
                    <input 
                      className="edit-input"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                    />
                  ) : (
                    <>
                      <div className={`task-title ${task.isCompleted ? 'completed' : ''}`}>
                        {task.title}
                      </div>
                      <div className="task-date">
                        {new Date(task.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="task-actions">
                  {editingTaskId === task.id ? (
                    <>
                      <button className="btn-action save" onClick={() => saveEdit(task.id)}>
                        <Save size={18} />
                      </button>
                      <button className="btn-action" onClick={() => setEditingTaskId(null)}>
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-action" onClick={() => startEditing(task)}>
                        <Pencil size={18} />
                      </button>
                      <button className="btn-action delete" onClick={() => deleteTask(task.id)}>
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
