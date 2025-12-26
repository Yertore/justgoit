import React, { useState } from "react";
import { createQuestion } from "../api/questions";

export default function QuestionForm() {
  const [title, setTitle] = useState("");
  const [answer, setAnswer] = useState("");
  const [level, setLevel] = useState("junior");
  const [category, setCategory] = useState("");
  const [popularity, setPopularity] = useState(50);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newQ = { title, answer, level, category, popularity: Number(popularity) };
    await createQuestion(newQ);
    setTitle(""); setAnswer(""); setCategory(""); setPopularity(50);
    alert("Question created!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Question</h2>
      <div>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <textarea placeholder="Answer" value={answer} onChange={e => setAnswer(e.target.value)} required />
      </div>
      <div>
        <input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required />
      </div>
      <div>
        <select value={level} onChange={e => setLevel(e.target.value)}>
          <option value="junior">junior</option>
          <option value="middle">middle</option>
          <option value="senior">senior</option>
        </select>
      </div>
      <div>
        <input type="number" value={popularity} onChange={e => setPopularity(e.target.value)} />
      </div>
      <button type="submit">Create</button>
    </form>
  );
}
