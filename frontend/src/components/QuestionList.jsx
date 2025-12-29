import React, { useEffect, useState } from "react";
import { fetchQuestions } from "../api/questions";
import "../style.css"; // CSS отдельно

export default function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [openAnswers, setOpenAnswers] = useState({}); // { [id]: true/false }

  useEffect(() => {
    fetchQuestions().then(setQuestions);
  }, []);

  const toggleAnswer = (id) => {
    setOpenAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="question-list-container">
      <h2>All Questions</h2>
      {questions.length === 0 ? (
        <p>No questions yet.</p>
      ) : (
        <div className="questions-wrapper">
          {questions.map((q) => (
            <div key={q.id} className="question-card">
              <div className="question-header">
                <strong>{q.title}</strong> <span className="popularity">({q.popularity}%)</span>
              </div>
              <div className="question-meta">
                <em>{q.level} / {q.category}</em>
              </div>
              {openAnswers[q.id] && <p className="question-answer">{q.answer}</p>}
              <button className="answer-btn" onClick={() => toggleAnswer(q.id)}>
                {openAnswers[q.id] ? "Скрыть ответ" : "Показать ответ"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
