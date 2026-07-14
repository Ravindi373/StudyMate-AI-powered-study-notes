const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function fetchNotes() {
  const res = await fetch(`${API_BASE}/notes`);
  return handleResponse(res);
}

export async function createNote(note) {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  return handleResponse(res);
}

export async function updateNote(id, note) {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  return handleResponse(res);
}

export async function deleteNote(id) {
  const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

export async function summarizeNote(id) {
  const res = await fetch(`${API_BASE}/notes/${id}/summarize`, { method: 'POST' });
  return handleResponse(res);
}

export async function generateQuiz(id) {
  const res = await fetch(`${API_BASE}/notes/${id}/quiz`, { method: 'POST' });
  return handleResponse(res);
}