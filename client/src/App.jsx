import { useEffect, useState } from 'react';
import NoteForm from './components/NoteForm.jsx';
import NoteCard from './components/NoteCard.jsx';
import SearchBar from './components/SearchBar.jsx';
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  summarizeNote,
  generateQuiz,
} from './api.js';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) {
      setError('Could not load notes. Is the API server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEdit = async (noteData, id) => {
    if (id) {
      const updated = await updateNote(id, noteData);
      setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
      setEditingNote(null);
    } else {
      const created = await createNote(noteData);
      setNotes((prev) => [created, ...prev]);
    }
  };

  const handleDelete = async (id) => {
    const previous = notes;
    setNotes((prev) => prev.filter((n) => n._id !== id));
    try {
      await deleteNote(id);
    } catch (err) {
      setNotes(previous);
      setError('Failed to delete note.');
    }
  };

  const handleSummarize = async (id) => {
    try {
      const updated = await summarizeNote(id);
      setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
    } catch (err) {
      setError('Failed to generate AI summary.');
    }
  };

  const handleGenerateQuiz = async (id) => {
    try {
      const updated = await generateQuiz(id);
      setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
    } catch (err) {
      setError('Failed to generate quiz.');
    }
  };

  const filteredNotes = notes.filter((n) => {
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.subject.toLowerCase().includes(q);
  });

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 StudyMate</h1>
        <p>Your AI-powered study notes</p>
      </header>

      <main className="app-main">
        <section className="form-section">
          <NoteForm
            onSubmit={handleAddOrEdit}
            editingNote={editingNote}
            onCancelEdit={() => setEditingNote(null)}
          />
        </section>

        <section className="notes-section">
          <SearchBar value={search} onChange={setSearch} />

          {error && <p className="error-banner">{error}</p>}

          {loading ? (
            <p className="loading-state">Loading notes...</p>
          ) : filteredNotes.length === 0 ? (
            <p className="empty-state">
              {notes.length === 0
                ? 'No notes yet — add your first one!'
                : 'No notes match your search.'}
            </p>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onDelete={handleDelete}
                  onEdit={setEditingNote}
                  onSummarize={handleSummarize}
                  onGenerateQuiz={handleGenerateQuiz}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}