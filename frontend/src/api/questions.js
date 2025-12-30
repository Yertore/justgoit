//const API_URL = import.meta.env.VITE_API_URL;

export async function fetchQuestions({ page = 1, limit = 10, level = "", category = "" } = {}) {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);
  if (level) params.append("level", level);
  if (category) params.append("category", category);

  const res = await fetch(`/api/v1/questions?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json(); // ожидаем { questions: [...], totalPages: n }
}

export async function createQuestion(question) {
  const res = await fetch("/api/v1/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(question)
  });
  if (!res.ok) throw new Error("Failed to create");
  return res.json();
}
