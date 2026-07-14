import { useState, useEffect } from 'react';

export default function NoteForm({ onSubmit, editingNote, onCancelEdit }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setSubject(editingNote.subject);
      setContent(editingNote.content);
    }
  }, [editingNote]);

  const resetForm = () => {
    setTitle('');
    setSubject('');
    setContent('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Title and content cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title, subject, content }, editingNote?._id);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <h2>{editingNote ? 'Edit note' : 'Add a new note'}</h2>

      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Photosynthesis basics"
        />
      </label>

      <label>
        Subject
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Biology"
        />
      </label>

      <label>
        Content
        <textarea
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your notes here..."
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : editingNote ? 'Save changes' : 'Add note'}
        </button>
        {editingNote && (
          <button type="button" className="btn-secondary" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
