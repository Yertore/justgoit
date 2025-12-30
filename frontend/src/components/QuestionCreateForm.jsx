import React, { useState, useRef, useEffect } from "react";
import { createQuestion } from "../api/questions";
import "../styles/createform.css";

export default function QuestionCreateForm() {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [answer, setAnswer] = useState("");
  const [level, setLevel] = useState("junior");
  const [category, setCategory] = useState("");
  const [popularity, setPopularity] = useState(50);
  const [loading, setLoading] = useState(false);

  // notification: { id, type: 'success'|'error', title, message' } or null
  const [notification, setNotification] = useState(null);
  const notifTimerRef = useRef(null);

  const titleRef = useRef(null);

  const resetForm = () => {
    setTitle("");
    setAnswer("");
    setLevel("junior");
    setCategory("");
    setPopularity(50);
  };

  // focus the title input when modal opens
  useEffect(() => {
    if (open && titleRef.current) {
      setTimeout(() => titleRef.current.focus(), 50);
    }
  }, [open]);

  // Lock body scroll while modal open and handle Escape key
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKey);
    } else {
      document.body.style.overflow = prevOverflow || "";
    }

    return () => {
      document.body.style.overflow = prevOverflow || "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

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

  const showNotification = ({ type = "success", title = "", message = "" }) => {
    setNotification({
      id: Date.now(),
      type,
      title,
      message,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !answer.trim() || !category.trim()) {
      showNotification({
        type: "error",
        title: "Заполните поля",
        message: "Пожалуйста, заполните Title, Answer и Category.",
      });
      return;
    }

    setLoading(true);
    try {
      const newQ = {
        title: title.trim(),
        answer: answer.trim(),
        level,
        category: category.trim(),
        popularity: Number(popularity) || 0,
      };

      // assume createQuestion returns created object (server response)
      const created = await createQuestion(newQ);

      resetForm();
      setOpen(false);

      // notify user
      showNotification({
        type: "success",
        title: "Готово",
        message: "Вопрос успешно создан.",
      });

      // Dispatch an event so any list on the page can refresh immediately
      try {
        window.dispatchEvent(new CustomEvent("question:created", { detail: created || newQ }));
      } catch (err) {
        // IE fallback: use document
        const ev = document.createEvent("CustomEvent");
        ev.initCustomEvent("question:created", true, true, created || newQ);
        document.dispatchEvent(ev);
      }
    } catch (err) {
      console.error("Failed to create question", err);
      showNotification({
        type: "error",
        title: "Ошибка",
        message: "Не удалось создать вопрос. Проверьте консоль.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => setOpen(true)}
        aria-label="Create question"
        title="Create question"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Modal and Notification UI — unchanged from previous working version */}
      {open && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="create-question-title">
            <div className="modal-header">
              <h3 id="create-question-title">Create Question</h3>
              <button className="btn-icon" aria-label="Close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              <label className="label">
                Title
                <textarea
                  ref={titleRef}
                  className="title-textarea"
                  placeholder="Short question title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  rows={1}
                />
              </label>

              <label className="label">
                Answer (markdown supported)
                <textarea
                  className="textarea"
                  placeholder="Full answer in markdown"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                />
                <div className="hint">You can paste large text — this area scrolls.</div>
              </label>

              <div className="form-row">
                <label className="label small">
                  Level
                  <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option value="junior">junior</option>
                    <option value="middle">middle</option>
                    <option value="senior">senior</option>
                  </select>
                </label>

                <label className="label small">
                  Popularity (%)
                  <input className="input small-input" type="number" min="0" max="100" value={popularity} onChange={(e) => setPopularity(e.target.value)} />
                </label>
              </div>

              <label className="label">
                Category
                <input className="input" placeholder="e.g. concurrency" value={category} onChange={(e) => setCategory(e.target.value)} required />
              </label>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { resetForm(); setOpen(false); }} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast notification (same as before) */}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {notification && (
          <div className={`toast toast-${notification.type}`} role="status">
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
    </>
  );
}