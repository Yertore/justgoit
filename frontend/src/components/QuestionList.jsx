import React, { useEffect, useState, useCallback, useRef } from "react";
import { fetchQuestions } from "../api/questions";
import MarkdownAnswer from "./MarkdownAnswer";
import QuestionEdit from "./QuestionEdit";
import QuestionCreate from "./QuestionCreate";

import "../styles/questions.css"
import "../styles/modalform.css"; 
import "../styles/answer.css"
import "../styles/chips.css"
import "../styles/filters.css"
import "../styles/pagination.css"


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
  const [editingQuestion, setEditingQuestion] = useState(null);

  // notification state (for toasts)
  const [notification, setNotification] = useState(null);
  const notifTimerRef = useRef(null);

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

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // reload on create/update events
  useEffect(() => {
    const handler = () => loadQuestions();
    window.addEventListener("question:created", handler);
    window.addEventListener("question:updated", handler);
    document.addEventListener("question:created", handler);
    document.addEventListener("question:updated", handler);
    return () => {
      window.removeEventListener("question:created", handler);
      window.removeEventListener("question:updated", handler);
      document.removeEventListener("question:created", handler);
      document.removeEventListener("question:updated", handler);
    };
  }, [loadQuestions]);

  // listen for global notifications (app:notification)
  useEffect(() => {
    const handler = (e) => {
      const d = e?.detail || {};
      setNotification({ id: Date.now(), ...d });
    };
    window.addEventListener("app:notification", handler);
    document.addEventListener("app:notification", handler);
    return () => {
      window.removeEventListener("app:notification", handler);
      document.removeEventListener("app:notification", handler);
    };
  }, []);

  // auto-hide notification
  useEffect(() => {
    if (!notification) return;
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => {
      setNotification(null);
      notifTimerRef.current = null;
    }, 3500);
    return () => {
      if (notifTimerRef.current) {
        clearTimeout(notifTimerRef.current);
        notifTimerRef.current = null;
      }
    };
  }, [notification]);

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
            <div style={{ display: "flex", gap: 8 }}>
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

              {/* Edit button */}
              <button
                onClick={() => setEditingQuestion(q)}
              >
                Edit
              </button>
            </div>

            <div className="chips">
              <span className={`level-chip level-${q?.Level?.toLowerCase()}`}>
                {q?.Level}
              </span>
              <span className="topicl-chip">Тема: {q?.Category}</span>
              <span className="popularityl-chip">Популярность: {q?.Popularity}%</span>
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

      {/* Create modal */}
      <QuestionCreate />
      {/* Edit modal */}
      {editingQuestion && (
        <QuestionEdit question={editingQuestion} onClose={() => setEditingQuestion(null)} />
      )}

      {/* Global toast (renders inside QuestionList so always mounted on list page) */}
      <div className="toast-container" aria-live="polite" aria-atomic="true" style={{ pointerEvents: "none" }}>
        {notification && (
          <div className={`toast toast-${notification.type || "success"}`} role="status" style={{ pointerEvents: "auto" }}>
            <div className="toast-left">
              {notification.type === "success" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 9v4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 17h.01" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="toast-body">
              <div className="toast-title">{notification.title}</div>
              <div className="toast-message">{notification.message}</div>
            </div>
            <button className="toast-close" onClick={() => setNotification(null)} aria-label="Close notification">✕</button>
          </div>
        )}
      </div>
    </div>
  );
}