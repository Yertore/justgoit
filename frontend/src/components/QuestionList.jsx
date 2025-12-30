import React, { useEffect, useState } from "react";
import { fetchQuestions } from "../api/questions";

export default function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [openAnswers, setOpenAnswers] = useState({});

  const loadQuestions = () => {
    fetchQuestions({ page, limit: 10, level, category }).then(data => {
      setQuestions(data.questions);
      setTotalPages(data.totalPages);
    });
  };

  // Загружаем вопросы при изменении page, level или category
  useEffect(() => {
    loadQuestions();
  }, [page, level, category]);

  // Сброс страницы при изменении фильтров
  const handleLevelChange = (e) => {
    setLevel(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  return (
    <div className="questions-list">
      {/* Фильтры */}
      <div className="filters">
        <select value={level} onChange={handleLevelChange}>
          <option value="">All Levels</option>
          <option value="junior">Junior</option>
          <option value="middle">Middle</option>
          <option value="senior">Senior</option>
        </select>

        <select value={category} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          <option value="concurrency">Concurrency</option>
          <option value="memory">Memory</option>
          <option value="stdlib">Stdlib</option>
          <option value="types">Types</option>
          <option value="runtime">Runtime</option>
          <option value="error-handling">Error Handling</option>
        </select>
      </div>

      {/* Список вопросов */}
      {questions.map((q, index) => (
        <div key={q.ID ?? index} className="question-card">
          <div className="question-header">
            <strong>{q.Title}</strong>
          </div>
          <div className="question-row">  
            <button
              onClick={() =>
                setOpenAnswers(prev => ({
                  ...prev,
                  [q.ID]: !prev[q.ID],
                }))
              }
            >
              {openAnswers[q.ID] ? "Скрыть ответ" : "Показать ответ"}
            </button>
            <div className="question-chips">
              <span className={`level-chip level-${q.Level?.toLowerCase()}`}>
                {q.Level}
              </span>
              <span className="topic">Тема: {q.Category}</span>
              <span className="popularity">Популярность: {q.Popularity}%</span>
            </div>
          </div>
          {openAnswers[q.ID] && (
            <div className="answer-wrapper">
              <div className="answer-content">
                {q.Answer}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Пагинация */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span>{page} / {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}
