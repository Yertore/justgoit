import React, { useEffect, useState } from "react";
import "../styles/modalform.css";

/**
 * Generic modal + question form.
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - initial: optional initial object { ID, Title, Answer, Level, Category, Popularity }
 *  - submitAction: async (payload) => createdOrUpdatedObject   // perform API call (createQuestion/updateQuestion)
 *  - successEvent: optional string event name to dispatch on success ("question:created"|"question:updated")
 *  - successMessage: optional string to show in app:notification
 *  - heading: modal title
 *  - submitLabel: button label ("Create" / "Save")
 */
export default function QuestionModalForm({
  open,
  onClose,
  initial = null,
  submitAction,
  successEvent,
  successMessage = "Saved",
  heading = "Question",
  submitLabel = "Save",
}) {
  const [title, setTitle] = useState(initial?.Title || "");
  const [answer, setAnswer] = useState(initial?.Answer || "");
  const [level, setLevel] = useState(initial?.Level || "junior");
  const [category, setCategory] = useState(initial?.Category || "");
  const [popularity, setPopularity] = useState(initial?.Popularity ?? 50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // sync with initial changes (when editing a different item)
  useEffect(() => {
    setTitle(initial?.Title || "");
    setAnswer(initial?.Answer || "");
    setLevel(initial?.Level || "junior");
    setCategory(initial?.Category || "");
    setPopularity(initial?.Popularity ?? 50);
    setError("");
  }, [initial, open]);

  if (!open) return null;

  const dispatchAppNotification = (payload) => {
    try {
      window.dispatchEvent(new CustomEvent("app:notification", { detail: payload }));
    } catch (err) {
      const ev = document.createEvent("CustomEvent");
      ev.initCustomEvent("app:notification", true, true, payload);
      document.dispatchEvent(ev);
    }
  };

  const dispatchDomainEvent = (name, detail) => {
    if (!name) return;
    try {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    } catch (err) {
      const ev = document.createEvent("CustomEvent");
      ev.initCustomEvent(name, true, true, detail);
      document.dispatchEvent(ev);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !answer.trim() || !category.trim()) {
      setError("Заполните Title, Answer и Category.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        // include ID only if editing
        ...(initial?.ID ? { ID: initial.ID } : {}),
        Title: title.trim(),
        Answer: answer.trim(),
        Level: level,
        Category: category.trim(),
        Popularity: Number(popularity) || 0,
      };

      const result = await submitAction(payload);

      // notify app (toast)
      dispatchAppNotification({
        type: "success",
        title: "Готово",
        message: successMessage,
      });

      // dispatch domain event for lists to reload
      dispatchDomainEvent(successEvent, result || payload);

      onClose && onClose();
    } catch (err) {
      console.error("Submit failed", err);
      setError("Не удалось сохранить. Проверьте консоль.");
      dispatchAppNotification({
        type: "error",
        title: "Ошибка",
        message: "Не удалось сохранить вопрос.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose && onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="question-modal-title">
        <div className="modal-header">
          <h3 id="question-modal-title">{heading}</h3>
          <button className="btn-icon" aria-label="Close" onClick={() => onClose && onClose()}>✕</button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <label className="label">
            Title
            <textarea
              className="title-textarea"
              placeholder="Short question title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={1}
              required
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
              <input
                className="input small-input"
                type="number"
                min="0"
                max="100"
                value={popularity}
                onChange={(e) => setPopularity(e.target.value)}
              />
            </label>
          </div>

          <label className="label">
            Category
            <input className="input" placeholder="e.g. concurrency" value={category} onChange={(e) => setCategory(e.target.value)} required />
          </label>

          {error && <div style={{ color: "#cc3333", marginTop: 6 }}>{error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onClose && onClose()} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (submitLabel || "Saving...") : (submitLabel || "Save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}