import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema(
  {
    bullets: { type: [String], default: [] },
    quizQuestion: { type: String, default: '' },
    generatedAt: { type: Date },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    questions: { type: [Object], default: [] },
    generatedAt: { type: Date },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  subject: {
    type: String,
    trim: true,
    default: 'General',
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
  },
  summary: {
    type: summarySchema,
    default: null,
  },
  quiz: {
    type: quizSchema,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Note = mongoose.model('Note', noteSchema);

export default Note;