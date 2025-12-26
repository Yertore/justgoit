import React, { useEffect, useState } from "react";
import { fetchQuestions } from "../api/questions";
import QuestionItem from "./QuestionItem";

export default function QuestionList() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions().then(setQuestions);
  }, []);

  return (
    <div>
      <h2>All Questions</h2>
      {questions.length === 0 ? (
        <p>No questions yet.</p>
      ) : (
        <ul>
          {questions.map((q) => (
            <QuestionItem key={q.id} question={q} />
          ))}
        </ul>
      )}
    </div>
  );
}
