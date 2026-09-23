import React, { useState, useEffect } from 'react';
import { taskAPI, authAPI } from '../api';
import Navbar from '../components/Navbar';
import StatsCards from '../components/StatsCards';
import TaskFilters from '../components/TaskFilters';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import CannotDoModal from '../components/CannotDoModal';
import { Plus, ListTodo, RefreshCw, AlertCircle } from 'lucide-react';

export default function Dashboard({ user, onLogout, viewMode, setViewMode }) {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [activeTab, setActiveTab] = useState('all'); // all, assignedToMe, assignedByMe, blocked
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCannotDoModalOpen, setIsCannotDoModalOpen] = useState(false);
  const [selectedTaskForCannotDo, setSelectedTaskForCannotDo] = useState(null);

  // Fetch team members and tasks
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [tasksRes, usersRes] = await Promise.all([
        taskAPI.getTasks(),
        authAPI.getUsers(),
      ]);

      setTasks(tasksRes.tasks || []);
      setTeamMembers(usersRes.users || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Error connecting to Village Coders server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle task status transitions
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskAPI.updateStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.task : t))
      );
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  // Open the "Cannot Do" modal to prompt for reason
  const handleOpenCannotDoModal = (task) => {
    setSelectedTaskForCannotDo(task);
    setIsCannotDoModalOpen(true);
  };

  // Submit Cannot-Do reason from the prompt modal
  const handleSubmitCannotDoReason = async (taskId, reason) => {
    const res = await taskAPI.updateStatus(taskId, 'Cannot Do', reason);
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? res.task : t))
    );
  };

  // Create new task
  const handleCreateTask = async (taskData) => {
    const res = await taskAPI.createTask(taskData);
    setTasks((prev) => [res.task, ...prev]);
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.message || 'Error deleting task');
    }
  };

  // Filter tasks based on UI inputs
  const filteredTasks = tasks.filter((task) => {
    // Tab filter
    if (activeTab === 'assignedToMe' && task.assignedTo?._id !== user._id) {
      return false;
    }
    if (activeTab === 'assignedByMe' && task.assignedBy?._id !== user._id) {
      return false;
    }
    if (activeTab === 'blocked' && task.status !== 'Cannot Do') {
      return false;
    }

    // Dropdowns
    if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
      return false;
    }
    if (statusFilter !== 'All' && task.status !== statusFilter) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchReason = task.cannotDoReason?.toLowerCase().includes(q);
      const matchAssignee = task.assignedTo?.name?.toLowerCase().includes(q);
      const matchAssigner = task.assignedBy?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchReason && !matchAssignee && !matchAssigner) {
        return false;
      }
    }

    return true;
  });

  const blockedCount = tasks.filter((t) => t.status === 'Cannot Do').length;

  return (
    <div className={`app-container ${viewMode === 'mobile' ? 'mode-mobile-frame' : 'mode-full-width'}`}>
      <div className="app-phone-shell">
        {/* Navigation Bar */}
        <Navbar
          user={user}
          onLogout={onLogout}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Main Content Body */}
        <div className="app-content">
          {/* Stats Bar */}
          <StatsCards
            tasks={tasks}
            activeFilter={activeTab}
            setActiveFilter={(filterKey) => {
              if (filterKey === 'progress') {
                setStatusFilter('In Progress');
                setActiveTab('all');
              } else if (filterKey === 'completed') {
                setStatusFilter('Completed');
                setActiveTab('all');
              } else if (filterKey === 'blocked') {
                setActiveTab('blocked');
                setStatusFilter('All');
              } else {
                setActiveTab('all');
                setStatusFilter('All');
              }
            }}
          />

          {/* Section Heading & Assign Task Action */}
          <div className="section-banner">
            <div className="section-title">
              <ListTodo size={20} color="var(--brand-primary)" />
              <span>Team Taskboard</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="icon-btn"
                title="Refresh tasks"
                onClick={loadData}
              >
                <RefreshCw size={16} className={loading ? 'spin' : ''} />
              </button>

              <button
                className="btn-assign-primary"
                onClick={() => setIsTaskModalOpen(true)}
              >
                <Plus size={16} />
                <span>Assign Task</span>
              </button>
            </div>
          </div>

          {/* Filters, Tabs & Search */}
          <TaskFilters
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            blockedCount={blockedCount}
          />

          {error && (
            <div className="alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Task List */}
          {loading && tasks.length === 0 ? (
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <RefreshCw size={24} className="spin" />
              </div>
              <p>Loading Village Coders tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <ListTodo size={28} />
              </div>
              <h3>No tasks found</h3>
              <p>
                {activeTab === 'blocked'
                  ? 'Great job! No tasks are currently blocked or marked as cannot-do.'
                  : 'No tasks match your current filters. Click "+ Assign Task" to add one!'}
              </p>
              <button
                className="btn-assign-primary"
                style={{ marginTop: '8px' }}
                onClick={() => setIsTaskModalOpen(true)}
              >
                <Plus size={16} /> Assign a New Task
              </button>
            </div>
          ) : (
            <div className="task-list">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  currentUser={user}
                  onStatusChange={handleStatusChange}
                  onOpenCannotDoModal={handleOpenCannotDoModal}
                  onDeleteTask={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <button
          className="fab-assign"
          title="Quick Assign Task"
          onClick={() => setIsTaskModalOpen(true)}
        >
          <Plus size={26} />
        </button>

        {/* Modals */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleCreateTask}
          teamMembers={teamMembers}
          currentUser={user}
        />

        <CannotDoModal
          task={selectedTaskForCannotDo}
          isOpen={isCannotDoModalOpen}
          onClose={() => {
            setIsCannotDoModalOpen(false);
            setSelectedTaskForCannotDo(null);
          }}
          onSubmitReason={handleSubmitCannotDoReason}
        />
      </div>
    </div>
  );
}
