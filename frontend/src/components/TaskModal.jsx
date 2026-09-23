import React, { useState } from 'react';
import { X, PlusCircle, Calendar, Flag, UserCheck } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, teamMembers = [], currentUser }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  // Default deadline: tomorrow at 5:00 PM
  const getDefaultDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(17, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };
  const [deadline, setDeadline] = useState(getDefaultDeadline());
  const [assignedTo, setAssignedTo] = useState(teamMembers[0]?._id || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title');
      return;
    }
    if (!assignedTo) {
      setError('Please select a team member to assign this task to');
      return;
    }
    if (!deadline) {
      setError('Please specify a task deadline');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        deadline,
        assignedTo,
      });
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message || 'Error assigning task');
    } finally {
      setSaving(false);
    }
  };

  const isBoss = currentUser?.role === 'Boss';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <PlusCircle size={22} color="var(--brand-primary)" />
            {isBoss ? 'Assign Team Task' : 'Create & Assign Task'}
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Task Title <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Implement MongoDB Schema & Auth Middleware"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Instructions</label>
            <textarea
              className="form-textarea"
              placeholder="Provide clear acceptance criteria, links, or context..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Flag size={14} color="#f97316" /> Priority Level
              </label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Urgent">Urgent Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} color="var(--brand-primary-light)" /> Deadline
              </label>
              <input
                type="datetime-local"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <UserCheck size={14} color="#10b981" /> Assign To Teammate <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              className="form-select"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              required
            >
              <option value="" disabled>Select team member...</option>
              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.role === 'Boss' ? 'Team Lead' : (member.title || 'Developer')}) - {member.email}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-assign-primary"
              disabled={saving}
            >
              {saving ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
