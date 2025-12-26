import React from "react";

export default function QuestionItem({ question }) {
  return (
    <li>
      <strong>{question.title}</strong> ({question.popularity}%)
      <br />
      <em>{question.level} / {question.category}</em>
      <p>{question.answer}</p>
    </li>
  );
}
