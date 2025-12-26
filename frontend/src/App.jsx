import React from "react";
import QuestionList from "./components/QuestionList";
import QuestionForm from "./components/QuestionForm";

function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>JustGoIt Questions</h1>
      <QuestionForm />
      <hr />
      <QuestionList />
    </div>
  );
}

export default App;
