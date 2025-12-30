import React, { useEffect, useState, useCallback } from "react";
import { fetchQuestions } from "../api/questions";
import MarkdownAnswer from "./MarkdownAnswer";

const KNOWN_CATEGORIES = [
  "concurrency",
  "memory",
  "stdlib",
  "types",
  "string",
  "runtime",
  "error-handling",
];

export default function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [openAnswers, setOpenAnswers] = useState({});

  // useCallback so the event listener can depend on a stable reference
  const loadQuestions = useCallback(() => {
    fetchQuestions({ page, limit: 10, level, category })
      .then((data) => {
        const items = Array.isArray(data?.questions) ? data.questions : [];
        setQuestions(items);
        setTotalPages(Number(data?.totalPages) || 1);
      })
      .catch((err) => {
        console.error("Failed to load questions", err);
        setQuestions([]);
        setTotalPages(1);
      });
  }, [page, level, category]);

  // initial and reactive loading
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Listen for questions created elsewhere and reload current list
  useEffect(() => {
    const handler = (e) => {
      // Optionally: use e.detail (created question) to decide more clever behavior.
      // For now: reload the current page with current filters so UI stays consistent.
      loadQuestions();
    };

    window.addEventListener("question:created", handler);
    // also support older document-based dispatch in fallback
    document.addEventListener("question:created", handler);

    return () => {
      window.removeEventListener("question:created", handler);
      document.removeEventListener("question:created", handler);
    };
  }, [loadQuestions]);

  // handlers
  const handleLevelChange = (e) => {
    setLevel(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    setPage(1);
  };

  return (
    <div className="questions-list">
      {/* Filters */}
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
          <option value="string">String</option>
          <option value="runtime">Runtime</option>
          <option value="error-handling">Error Handling</option>
        </select>
      </div>

      {/* Questions */}
      {(questions || []).map((q, index) => (
        <div key={q?.ID ?? index} className="question-card">
          <div className="question-header">
            <strong>{q?.Title}</strong>
          </div>
          <div className="question-row">
            <button
              onClick={() =>
                setOpenAnswers((prev) => ({
                  ...prev,
                  [q?.ID]: !prev[q?.ID],
                }))
              }
            >
              {openAnswers[q?.ID] ? "Скрыть ответ" : "Показать ответ"}
            </button>
            <div className="question-chips">
              <span className={`level-chip level-${q?.Level?.toLowerCase()}`}>
                {q?.Level}
              </span>
              <span className="topic">Тема: {q?.Category}</span>
              <span className="popularity">Популярность: {q?.Popularity}%</span>
            </div>
          </div>
          {openAnswers[q?.ID] && (
            <div className="answer-wrapper">
              <div className="answer-content">
                <MarkdownAnswer content={q?.Answer || ""} />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Pagination */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}