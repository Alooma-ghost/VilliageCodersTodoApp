import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Calendar, Flag, UserCheck, AlertCircle } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, teamMembers = [], currentUser }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  // Format local deadline: tomorrow at 5:00 PM (local time string for datetime-local)
  const getDefaultDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(17, 0, 0, 0);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [deadline, setDeadline] = useState(getDefaultDeadline());
  const [assignedTo, setAssignedTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Automatically sync and pick an initial team member when opened or when members load
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (teamMembers && teamMembers.length > 0) {
        const currentMemberValid = teamMembers.some(
          (m) => (m._id || m.id)?.toString() === assignedTo?.toString()
        );

        if (!assignedTo || !currentMemberValid) {
          // If possible, default to currentUser, or to first available teammate
          const myId = (currentUser?._id || currentUser?.id)?.toString();
          const me = teamMembers.find((m) => (m._id || m.id)?.toString() === myId);
          const defaultPick = me || teamMembers[0];
          if (defaultPick) {
            setAssignedTo((defaultPick._id || defaultPick.id).toString());
          }
        }
      }
    }
  }, [isOpen, teamMembers]);

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
            <label className="form-label">
              Task Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Implement Authentication & Workflow Integration"
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

            {teamMembers.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: '#f59e0b', padding: '8px', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} />
                <span>Loading team members...</span>
              </div>
            ) : (
              <select
                className="form-select"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
              >
                <option value="" disabled>Select team member...</option>
                {teamMembers.map((member) => {
                  const mId = (member._id || member.id)?.toString();
                  const isMe = mId === (currentUser?._id || currentUser?.id)?.toString();
                  return (
                    <option key={mId} value={mId}>
                      {member.name} ({member.role === 'Boss' ? 'Team Lead' : (member.title || 'Developer')}) {isMe ? '— (You)' : ''} - {member.email}
                    </option>
                  );
                })}
              </select>
            )}
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
              disabled={saving || teamMembers.length === 0}
            >
              {saving ? 'Assigning...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
