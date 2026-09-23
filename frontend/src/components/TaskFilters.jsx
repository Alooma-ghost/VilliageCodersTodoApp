import React from 'react';
import { Search, User, Send, AlertOctagon } from 'lucide-react';

export default function TaskFilters({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  statusFilter,
  setStatusFilter,
  blockedCount = 0,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Category Tabs */}
      <div className="filter-tabs-row">
        <button
          className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Tasks
        </button>

        <button
          className={`filter-tab ${activeTab === 'assignedToMe' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignedToMe')}
        >
          <User size={13} /> Assigned To Me
        </button>

        <button
          className={`filter-tab ${activeTab === 'assignedByMe' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignedByMe')}
        >
          <Send size={13} /> Assigned By Me
        </button>

        <button
          className={`filter-tab blocked-tab ${activeTab === 'blocked' ? 'active' : ''}`}
          onClick={() => setActiveTab('blocked')}
        >
          <AlertOctagon size={13} /> Cannot Do {blockedCount > 0 && `(${blockedCount})`}
        </button>
      </div>

      {/* Search and Dropdowns Bar */}
      <div className="filter-control-bar">
        <div className="search-box-wrap">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks, reasons, or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="select-dropdown"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          className="select-dropdown"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Cannot Do">Cannot Do</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>
  );
}
