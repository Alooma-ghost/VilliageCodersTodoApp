import React, { useState } from 'react';
import { AlertTriangle, X, Send } from 'lucide-react';

export default function CannotDoModal({ task, isOpen, onClose, onSubmitReason }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !task) return null;

  const quickReasons = [
    'Blocked by missing credentials or API keys',
    'Deadline conflicts with existing high-priority task',
    'Requires additional requirements or design clarification',
    'Tech stack mismatch / needs domain assistance',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a specific reason so the assigner or team lead can assist.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSubmitReason(task._id, reason.trim());
      setReason('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit reason');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ color: '#f43f5e' }}>
            <AlertTriangle size={22} />
            Unable to Complete Task
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          You are reporting that you cannot do: <strong style={{ color: '#fff' }}>"{task.title}"</strong>.
          Please explain the roadblock so{' '}
          <strong style={{ color: 'var(--brand-accent)' }}>
            {task.assignedBy?.name || 'the Team Lead'}
          </strong>{' '}
          can reassign, unblock, or adjust the deadline.
        </div>

        {error && <div className="alert-error">{error}</div>}

        {/* Quick chip suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Quick Suggestions (Click to fill)
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {quickReasons.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="btn-chip"
                style={{ fontSize: '0.72rem', textAlign: 'left' }}
                onClick={() => setReason(item)}
              >
                + {item}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">
              Reason / Roadblock <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="Explain clearly why you cannot do this task right now..."
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-danger-submit"
              disabled={submitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={15} />
              {submitting ? 'Submitting...' : 'Submit Roadblock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
