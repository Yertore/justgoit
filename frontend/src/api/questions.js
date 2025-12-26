//const API_URL = import.meta.env.VITE_API_URL;

export async function fetchQuestions() {
  const res = await fetch("/api/v1/questions");
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json();
}

export async function createQuestion(question) {
  const res = await fetch("/api/v1/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(question)
  });
  if (!res.ok) throw new Error("Failed to create")
  return res.json();
}
