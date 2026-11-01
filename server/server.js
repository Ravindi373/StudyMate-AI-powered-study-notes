import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import notesRouter from './routes/notes.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studymate';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'StudyMate API is running' });
});

// One shared MongoDB connection, opened on first use and reused afterwards.
// Serverless hosts such as Vercel start the app on demand, so the old
// "connect once at boot, then listen" approach does not work there.
let connection = null;
function connectDB() {
  if (!connection) {
    connection = mongoose
      .connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
      .catch((err) => {
        connection = null; // allow a retry on the next request
        throw err;
      });
  }
  return connection;
}

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(503).json({ error: 'Database unavailable. Please try again.' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Last-resort error handler (for example, malformed JSON in a request body)
app.use((err, req, res, next) => {
  const status = err.status && err.status < 500 ? err.status : 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status < 500 ? err.message : 'Something went wrong' });
});

// Locally (npm start) run a normal server. On Vercel the exported app is used instead.
if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => console.log(`StudyMate API listening on port ${PORT}`));
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
}

export default app;
