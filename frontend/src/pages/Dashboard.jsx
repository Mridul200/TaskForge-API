import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../AuthContext';
import Banner from '../components/Banner';

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Navigation tabs for Admin
  const [activeTab, setActiveTab] = useState(isAdmin ? 'stats' : 'tasks');

  // Core Data States
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  // Status & Forms States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ title: '', description: '', status: 'pending' });
  const [editingId, setEditingId] = useState(null);

  async function loadTasks() {
    setLoading(true);
    setError('');
    try {
      const res = await api.getTasks(1, 100); // Fetch all tasks (up to 100 for dev testing)
      setTasks(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadAdminData() {
    if (!isAdmin) return;
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminStats(),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadTasks();
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  function flashSuccess(msg) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 2500);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.updateTask(editingId, form);
        flashSuccess('Task updated');
      } else {
        await api.createTask(form);
        flashSuccess('Task created');
      }
      setForm({ title: '', description: '', status: 'pending' });
      setEditingId(null);
      loadTasks();
      if (isAdmin) loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(task) {
    setEditingId(task.id);
    setForm({ title: task.title, description: task.description || '', status: task.status });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ title: '', description: '', status: 'pending' });
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return;
    setError('');
    try {
      await api.deleteTask(id);
      flashSuccess('Task deleted');
      loadTasks();
      if (isAdmin) loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  // --- Admin Specific handlers ---
  async function handleToggleRole(targetUser) {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    setError('');
    try {
      await api.updateAdminUser(targetUser.id, { role: nextRole });
      flashSuccess(`Role updated to ${nextRole}`);
      loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteUser(targetUserId) {
    if (!confirm('Are you absolutely sure you want to delete this user? This will also delete all their tasks.')) return;
    setError('');
    try {
      await api.deleteAdminUser(targetUserId);
      flashSuccess('User account and tasks deleted successfully.');
      loadAdminData();
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Task Dashboard</h1>
          <p className="subtitle">
            Logged in as <strong>{user?.name}</strong> ({user?.role})
          </p>
        </div>
        <button className="btn-secondary" onClick={logout}>Log Out</button>
      </header>

      <Banner type="error" message={error} />
      <Banner type="success" message={success} />

      {/* Tabs navigation for Admin */}
      {isAdmin && (
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistics Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            📋 Manage Tasks ({tasks.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Directory ({users.length})
          </button>
        </div>
      )}

      {/* VIEW 1: Admin Stats Panel */}
      {isAdmin && activeTab === 'stats' && stats && (
        <div className="admin-stats-section">
          <h2>System Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card stat-users">
              <span className="stat-val">{stats.totalUsers}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-card stat-tasks">
              <span className="stat-val">{stats.totalTasks}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
            <div className="stat-card stat-pending">
              <span className="stat-val">{stats.pendingTasks}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card stat-in-progress">
              <span className="stat-val">{stats.inProgressTasks}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-card stat-completed">
              <span className="stat-val">{stats.completedTasks}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Manage Tasks View (both user and admin) */}
      {activeTab === 'tasks' && (
        <>
          <div className="section-header">
            <h2>{isAdmin ? 'System Task Directory' : 'My Tasks'}</h2>
          </div>

          <form className="task-form" onSubmit={handleSubmit}>
            <input
              placeholder="Task title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <button type="submit">{editingId ? 'Save' : 'Add'}</button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>
            )}
          </form>

          {loading ? (
            <p className="center-msg">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="center-msg">No tasks yet.</p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className="task-item">
                  <div>
                    <h3>{task.title}</h3>
                    {task.description && <p>{task.description}</p>}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`status-badge status-${task.status}`}>
                        {STATUS_LABELS[task.status]}
                      </span>
                      {isAdmin && (
                        <span className="status-badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                          Owner ID: {task.user_id}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="task-actions">
                    <button className="btn-secondary" onClick={() => startEdit(task)}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDelete(task.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* VIEW 3: Admin User Management View */}
      {isAdmin && activeTab === 'users' && (
        <div className="admin-users-section">
          <h2>User Directory & Access Control</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`status-badge ${u.role === 'admin' ? 'status-in_progress' : 'status-pending'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="user-actions">
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', marginTop: 0 }}
                          onClick={() => handleToggleRole(u)}
                        >
                          Change Role
                        </button>
                        {u.id !== user.id && (
                          <button
                            className="btn-danger"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', marginTop: 0 }}
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            Delete User
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
