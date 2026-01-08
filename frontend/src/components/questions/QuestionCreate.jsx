import React, { useState } from "react";
import { createQuestion } from "../../api/questions";
import QuestionModalForm from "./QuestionModalForm";

export default function QuestionCreate() {
  const [open, setOpen] = useState(false);

  // submit action wrapper
  const submitCreate = async (payload) => {
    // createQuestion expects fields: title, answer, level, category, popularity
    const toSend = {
      title: payload.Title,
      answer: payload.Answer,
      level: payload.Level,
      category: payload.Category,
      popularity: payload.Popularity,
    };
    return createQuestion(toSend);
  };

  return (
    <>
      <button className="fab" onClick={() => setOpen(true)} aria-label="Create question">+</button>

      <QuestionModalForm
        open={open}
        onClose={() => setOpen(false)}
        initial={null}
        submitAction={submitCreate}
        successEvent="question:created"
        successMessage="Вопрос успешно создан."
        heading="Create Question"
        submitLabel="Create"
      />
    </>
  );
}