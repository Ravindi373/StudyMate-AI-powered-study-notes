const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('studymate_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function fetchNotes() {
  const res = await fetch(`${API_BASE}/notes`, {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function createNote(note) {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(note),
  });
  return handleResponse(res);
}

export async function updateNote(id, note) {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(note),
  });
  return handleResponse(res);
}

export async function deleteNote(id) {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function summarizeNote(id) {
  const res = await fetch(`${API_BASE}/notes/${id}/summarize`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function generateQuiz(id) {
  const res = await fetch(`${API_BASE}/notes/${id}/quiz`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}