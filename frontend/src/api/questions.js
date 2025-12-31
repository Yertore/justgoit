// Updated API helpers — add updateQuestion to use the correct /api/v1 path
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

// New helper: updateQuestion
export async function updateQuestion(question) {
  if (!question || !question.ID) throw new Error("Missing question ID");
  const res = await fetch(`/api/v1/questions/${encodeURIComponent(question.ID)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(question),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Failed to update (${res.status})`);
  }
  // If server returns JSON — parse it; otherwise return the payload as fallback
  return res.json().catch(() => question);
}