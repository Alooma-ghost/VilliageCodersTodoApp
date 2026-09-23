import React from 'react';

export default function StatsCards({ tasks, activeFilter, setActiveFilter }) {
  const total = tasks.length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const cannotDo = tasks.filter((t) => t.status === 'Cannot Do').length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="stats-grid">
      <div
        className={`stat-pill ${activeFilter === 'all' ? 'active' : ''}`}
        onClick={() => setActiveFilter('all')}
        title="Show all tasks"
      >
        <span className="stat-number">{total}</span>
        <span className="stat-label">Total Tasks</span>
      </div>

      <div
        className={`stat-pill ${activeFilter === 'progress' ? 'active' : ''}`}
        onClick={() => setActiveFilter('progress')}
        title="Tasks in progress"
      >
        <span className="stat-number" style={{ color: 'var(--brand-primary-light, #22d3ee)' }}>{inProgress}</span>
        <span className="stat-label">Active</span>
      </div>

      <div
        className={`stat-pill blocked ${activeFilter === 'blocked' ? 'active' : ''}`}
        onClick={() => setActiveFilter('blocked')}
        title="Tasks flagged as Cannot Do"
      >
        <span className="stat-number" style={{ color: '#f43f5e' }}>{cannotDo}</span>
        <span className="stat-label">Cannot Do</span>
      </div>

      <div
        className={`stat-pill ${activeFilter === 'completed' ? 'active' : ''}`}
        onClick={() => setActiveFilter('completed')}
        title="Completed tasks"
      >
        <span className="stat-number" style={{ color: 'var(--brand-green, #699764)' }}>{completed}</span>
        <span className="stat-label">Done</span>
      </div>
    </div>
  );
}
