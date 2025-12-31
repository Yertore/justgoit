import React from "react";
import { updateQuestion } from "../api/questions";
import QuestionModalForm from "./QuestionModalForm";

/**
 * Thin wrapper for edit: passes initial data and update action to generic modal form.
 * Props:
 *  - question: object
 *  - onClose: fn
 */
export default function QuestionEdit({ question, onClose }) {
  if (!question) return null;

  const submitUpdate = async (payload) => {
    // updateQuestion expects an object with ID and other fields matching API
    const toSend = {
      ID: payload.ID,
      Title: payload.Title,
      Answer: payload.Answer,
      Level: payload.Level,
      Category: payload.Category,
      Popularity: payload.Popularity,
    };
    return updateQuestion(toSend);
  };

  return (
    <QuestionModalForm
      open={true}
      onClose={onClose}
      initial={question}
      submitAction={submitUpdate}
      successEvent="question:updated"
      successMessage="Вопрос успешно обновлён."
      heading="Edit Question"
      submitLabel="Save"
    />
  );
}