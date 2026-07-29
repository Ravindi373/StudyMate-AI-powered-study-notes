import { useState } from 'react';

export default function NoteCard({ note, onDelete, onEdit, onSummarize, onGenerateQuiz }) {
  const [summarizing, setSummarizing] = useState(false);
  const [quizzing, setQuizzing] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      await onSummarize(note._id);
    } finally {
      setSummarizing(false);
    }
  };

  const handleQuiz = async () => {
    setQuizzing(true);
    try {
      await onGenerateQuiz(note._id);
      setSelectedAnswers({});
    } finally {
      setQuizzing(false);
    }
  };

  const selectAnswer = (qIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  return (
    <div className="note-card">
      <div className="note-card-header">
        <h3>{note.title}</h3>
        <span className="subject-badge">{note.subject}</span>
      </div>

      <p className="note-content">{note.content}</p>

      {note.summary && note.summary.bullets?.length > 0 && (
        <div className="summary-box">
          <p className="summary-label">✨ AI Summary</p>
          <ul>
            {note.summary.bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
          {note.summary.quizQuestion && (
            <p className="quiz-question">🧠 Quiz: {note.summary.quizQuestion}</p>
          )}
        </div>
      )}

      {note.quiz && note.quiz.questions?.length > 0 && (
        <div className="quiz-box">
          <p className="summary-label">🧠 Quiz Mode</p>
          {note.quiz.questions.map((q, qIndex) => {
            const picked = selectedAnswers[qIndex];
            const hasAnswered = picked !== undefined;
            return (
              <div key={qIndex} className="quiz-question-block">
                <p className="quiz-q-text">{qIndex + 1}. {q.question}</p>
                <div className="quiz-options">
                  {q.options.map((option, optIndex) => {
                    let optionClass = 'quiz-option';
                    if (hasAnswered) {
                      if (optIndex === q.correctIndex) optionClass += ' correct';
                      else if (optIndex === picked) optionClass += ' incorrect';
                    }
                    return (
                      <button
                        key={optIndex}
                        className={optionClass}
                        disabled={hasAnswered}
                        onClick={() => selectAnswer(qIndex, optIndex)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="note-card-actions">
        <button className="btn-summarize" onClick={handleSummarize} disabled={summarizing}>
          {summarizing ? 'Summarizing...' : '✨ Summarize'}
        </button>
        <button className="btn-quiz" onClick={handleQuiz} disabled={quizzing}>
          {quizzing ? 'Building quiz...' : '🧠 Quiz Mode'}
        </button>
        <button className="btn-edit" onClick={() => onEdit(note)}>
          Edit
        </button>
        <button className="btn-delete" onClick={() => onDelete(note._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}