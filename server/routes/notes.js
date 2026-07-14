import express from 'express';
import Note from '../models/Note.js';

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGemini(prompt) {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || `Gemini API responded with ${response.status}`;
    throw new Error(message);
  }

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return rawText.trim().replace(/```json|```/g, '');
}

// GET /api/notes — list all notes, newest first
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST /api/notes — create a note
router.post('/', async (req, res) => {
  try {
    const { title, subject, content } = req.body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return res
        .status(400)
        .json({ error: 'Title and content are required and cannot be empty.' });
    }

    const note = await Note.create({
      title: title.trim(),
      subject: subject?.trim() || 'General',
      content: content.trim(),
    });

    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PUT /api/notes/:id — update a note
router.put('/:id', async (req, res) => {
  try {
    const { title, subject, content } = req.body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return res
        .status(400)
        .json({ error: 'Title and content are required and cannot be empty.' });
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        subject: subject?.trim() || 'General',
        content: content.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /api/notes/:id — delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// POST /api/notes/:id/summarize — AI summary + quiz question
router.post('/:id/summarize', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    const prompt = `You are a study assistant. Read the note below and respond with ONLY valid JSON
in this exact shape, no markdown fences, no extra text:

{"bullets": ["point 1", "point 2", "point 3"], "quizQuestion": "a single quiz question testing understanding of the note"}

Note title: ${note.title}
Note subject: ${note.subject}
Note content:
"""
${note.content}
"""`;

    const rawText = await callGemini(prompt);

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', rawText);
      return res.status(502).json({ error: 'AI returned an unexpected format' });
    }

    note.summary = {
      bullets: parsed.bullets || [],
      quizQuestion: parsed.quizQuestion || '',
      generatedAt: new Date(),
    };

    await note.save();

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to generate summary' });
  }
});

// POST /api/notes/:id/quiz — generate 3 multiple-choice questions
router.post('/:id/quiz', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    const prompt = `You are a study assistant. Read the note below and create exactly 3 multiple-choice
questions testing understanding of it. Respond with ONLY valid JSON, no markdown fences, no extra text,
in this exact shape:

{"questions": [
  {"question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0},
  {"question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 2},
  {"question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 1}
]}

correctIndex is the 0-based index into options for the right answer.

Note title: ${note.title}
Note subject: ${note.subject}
Note content:
"""
${note.content}
"""`;

    const rawText = await callGemini(prompt);

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse quiz response:', rawText);
      return res.status(502).json({ error: 'AI returned an unexpected format' });
    }

    note.quiz = {
      questions: parsed.questions || [],
      generatedAt: new Date(),
    };

    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz' });
  }
});

export default router;