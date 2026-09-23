import React from 'react';
import {
  Calendar,
  Clock,
  AlertOctagon,
  CheckCircle2,
  Play,
  RotateCcw,
  Trash2,
  User,
  ShieldCheck,
  Flame,
  Zap,
  Flag,
} from 'lucide-react';

export default function TaskCard({
  task,
  currentUser,
  onStatusChange,
  onOpenCannotDoModal,
  onDeleteTask,
}) {
  const isAssignee = task.assignedTo?._id === currentUser?._id;
  const isAssigner = task.assignedBy?._id === currentUser?._id;
  const isBoss = currentUser?.role === 'Boss';

  // Deadline formatting & overdue calculation
  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  const isOverdue = deadlineDate < now && task.status !== 'Completed';

  const formatDeadline = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPriorityIcon = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <Flame size={12} />;
      case 'High':
        return <Zap size={12} />;
      case 'Medium':
        return <Flag size={12} />;
      case 'Low':
        return <CheckCircle2 size={12} />;
      default:
        return <Flag size={12} />;
    }
  };

  return (
    <div className={`task-card priority-${task.priority}`}>
      {/* Top Header: Title & Badges */}
      <div className="task-card-header">
        <div className="task-card-title-group">
          <div className="task-badges-row">
            <span className={`priority-badge ${task.priority}`}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>{renderPriorityIcon(task.priority)}</span>
              {task.priority} Priority
            </span>

            <span className={`status-badge ${task.status.replace(/\s+/g, '-')}`}>
              {task.status === 'Cannot Do' ? 'Blocked / Cannot Do' : task.status}
            </span>
          </div>

          <h3 className="task-title">{task.title}</h3>
        </div>

        {/* Delete button (only assigner or Boss) */}
        {(isBoss || isAssigner) && (
          <button
            className="close-modal-btn"
            title="Delete task"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
                onDeleteTask(task._id);
              }
            }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Description if present */}
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {/* CRITICAL: Reason Callout if Cannot Do */}
      {task.status === 'Cannot Do' && task.cannotDoReason && (
        <div className="cannot-do-callout">
          <div className="cannot-do-callout-header">
            <AlertOctagon size={16} />
            <span>Roadblock / Reason Reported by {task.assignedTo?.name || 'Assignee'}:</span>
          </div>
          <p className="cannot-do-text">"{task.cannotDoReason}"</p>
          {task.cannotDoReportedAt && (
            <span className="cannot-do-time">
              Reported {new Date(task.cannotDoReportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
              {new Date(task.cannotDoReportedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Assignee & Assigner Row */}
      <div className="task-people-row">
        <div className="person-block">
          <span className="person-label">Assigned to:</span>
          <span className="person-val">
            <User size={13} />
            {task.assignedTo?.name || 'Unassigned'}
            {isAssignee && <span style={{ color: 'var(--brand-primary-light)', fontSize: '0.7rem' }}>(You)</span>}
          </span>
        </div>

        <div className="person-block">
          <span className="person-label">Assigned by:</span>
          <span className="person-val">
            {task.assignedBy?.name || 'Lead'}
          </span>
        </div>
      </div>

      {/* Deadline Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className={`task-deadline-badge ${isOverdue ? 'overdue' : ''}`}>
          <Calendar size={13} />
          <span>Deadline: {formatDeadline(deadlineDate)}</span>
          {isOverdue && <span style={{ fontWeight: 800 }}>⚠️ OVERDUE</span>}
        </div>
      </div>

      {/* Actions Row */}
      <div className="task-actions-row">
        <div className="status-change-group">
          {task.status === 'Pending' && (
            <button
              className="btn-status-act start"
              onClick={() => onStatusChange(task._id, 'In Progress')}
            >
              <Play size={13} /> Start Task
            </button>
          )}

          {task.status === 'In Progress' && (
            <button
              className="btn-status-act done"
              onClick={() => onStatusChange(task._id, 'Completed')}
            >
              <CheckCircle2 size={13} /> Mark Done
            </button>
          )}

          {task.status === 'Completed' && (
            <button
              className="btn-status-act start"
              onClick={() => onStatusChange(task._id, 'In Progress')}
            >
              <RotateCcw size={13} /> Reopen
            </button>
          )}

          {task.status === 'Cannot Do' && (
            <button
              className="btn-status-act start"
              onClick={() => onStatusChange(task._id, 'In Progress')}
            >
              <RotateCcw size={13} /> Try Again
            </button>
          )}
        </div>

        {/* Cannot Do Button (triggers interactive modal prompt!) */}
        {task.status !== 'Completed' && task.status !== 'Cannot Do' && (
          <button
            className="btn-cannot-do-trigger"
            onClick={() => onOpenCannotDoModal(task)}
            title="Mark as unable to complete and submit explanation"
          >
            <AlertOctagon size={14} /> Cannot Do
          </button>
        )}
      </div>
    </div>
  );
}
