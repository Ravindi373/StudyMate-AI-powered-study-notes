import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import notesRouter from './routes/notes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studymate';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'StudyMate API is running' });
});

app.use('/api/notes', notesRouter);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`StudyMate API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
