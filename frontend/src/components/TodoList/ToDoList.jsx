import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { 
  Plus, 
  X, 
  Check, 
  Pencil, 
  Trash2, 
  Calendar, 
  Clock,
  AlertCircle,
  CheckCircle,
  Circle
} from 'lucide-react';

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', description: '', status: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        try {
          const data = await api.getTasks();
          if (!isActive) return;
          setTasks(data || []);
        } catch (err) {
          console.warn('API getTasks failed, using dummy data:', err);
          // Gunakan data dummy jika API gagal
          const dummyTasks = [
            {
              id: '1',
              title: 'Parking Spot #1',
              description: 'Reserved by Dwi Rangga - Vehicle: B1234XYZ',
              status: 'pending',
              due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0]
            },
            {
              id: '2',
              title: 'Meeting Room Reservation',
              description: 'Reserved for team meeting',
              status: 'completed',
              due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
            },
            {
              id: '3',
              title: 'Parking Spot #2',
              description: 'Reserved by Test User - Vehicle: B5678ABC',
              status: 'pending',
              due_date: new Date(Date.now() + 172800000).toISOString().split('T')[0]
            }
          ];
          setTasks(dummyTasks);
        }
      } catch (err) {
        if (!isActive) return;
        setError(err.message);
        console.error('Error loading tasks:', err);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      isActive = false;
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description || '',
        status: 'pending',
        due_date: newTask.due_date || null,
      };

      try {
        const result = await api.createTask(taskData);
        setTasks([result, ...tasks]);
      } catch (err) {
        console.warn('API createTask failed, using local:', err);
        // Fallback: buat task lokal
        const newTaskLocal = {
          id: Date.now().toString(),
          ...taskData,
          created_at: new Date().toISOString()
        };
        setTasks([newTaskLocal, ...tasks]);
      }
      
      setNewTask({ title: '', description: '', due_date: '' });
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
      console.error('Error creating task:', err);
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setEditData({
      title: task.title,
      description: task.description || '',
      status: task.status
    });
  };

  const handleUpdate = async (id) => {
    try {
      try {
        const result = await api.updateTask(id, editData);
        setTasks(tasks.map(t => t.id === id ? result : t));
      } catch (err) {
        console.warn('API updateTask failed, using local:', err);
        // Fallback: update lokal
        setTasks(tasks.map(t => t.id === id ? { ...t, ...editData } : t));
      }
      setEditingId(null);
    } catch (err) {
      setError(err.message);
      console.error('Error updating task:', err);
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    try {
      try {
        const result = await api.updateTask(task.id, { status: newStatus });
        setTasks(tasks.map(t => t.id === task.id ? result : t));
      } catch (err) {
        console.warn('API toggle status failed, using local:', err);
        // Fallback: toggle lokal
        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      setError(err.message);
      console.error('Error toggling status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      try {
        await api.deleteTask(id);
      } catch (err) {
        console.warn('API deleteTask failed, using local:', err);
        // Fallback: delete lokal
      }
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting task:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
        <div className="flex justify-center items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent"></div>
          <span className="text-sm text-gray-500">Loading tasks...</span>
        </div>
      </div>
    );
  }

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Tasks</h3>
              <p className="text-xs text-gray-500">
                {pendingCount} pending · {completedCount} completed
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-3">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title..."
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              autoFocus
            />
            <input
              type="text"
              value={newTask.description || ''}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
            />
            <div className="flex gap-3">
              <input
                type="date"
                value={newTask.due_date || ''}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 text-sm"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-200 text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No tasks yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first task above</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto p-3">
          {tasks.map((task) => (
            <div key={task.id} className="py-3 px-2 hover:bg-gray-50 rounded-xl transition-all duration-200 group">
              {editingId === task.id ? (
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="text"
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Description"
                  />
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(task.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className="flex-shrink-0 hover:scale-110 transition-transform"
                    title="Toggle status"
                  >
                    {task.status === 'pending' ? (
                      <Circle className="w-5 h-5 text-gray-300 hover:text-blue-500 transition-colors" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 flex-shrink-0 ${
                        task.status === 'pending' 
                          ? 'bg-amber-100 text-amber-700 border-amber-200' 
                          : 'bg-green-100 text-green-700 border-green-200'
                      }`}>
                        {task.status === 'pending' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {task.status}
                      </span>
                    </div>
                    {task.description && (
                      <p className={`text-xs truncate ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {task.description}
                      </p>
                    )}
                    {task.due_date && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;