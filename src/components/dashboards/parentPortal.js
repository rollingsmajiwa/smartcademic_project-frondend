// Same fallback as AdminDashboard.jsx so every page talks to the same backend.
const API_BASE =
  import.meta.env.VITE_API_URL || "https://smartcademic-project.onrender.com";

function authHeaders(token) {
  const headers = { "Content-Type": "application/json" };
  const resolved =
    token ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("access");
  if (resolved) headers.Authorization = `Bearer ${resolved}`;
  return headers;
}

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data.detail ||
      data.error ||
      (typeof data === "object" && Object.keys(data).length
        ? JSON.stringify(data)
        : null) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

// NOTE: no `credentials: "include"`. We authenticate with a Bearer token,
// and credentialed requests break CORS unless the server is configured for it.
async function requestJson(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return parseResponse(res);
}

async function mutateJson(path, token, body, method = "POST") {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}

function buildQuery(paramsObj = {}) {
  const params = new URLSearchParams();
  Object.entries(paramsObj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.set(key, String(value).trim());
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ---------- Parent portal endpoints ----------
export function fetchParentMe(token) {
  return requestJson("/api/parents/me/", token);
}

export function updateParentMe(token, payload) {
  return mutateJson("/api/parents/me/", token, payload, "PATCH");
}

export function fetchParentChildren(token) {
  return requestJson("/api/parents/me/children/", token);
}

export function fetchParentReportCard(token, { studentId, term, year } = {}) {
  const qs = buildQuery({ student_id: studentId, term, year });
  return requestJson(`/api/parents/me/report-card/${qs}`, token);
}

export function fetchParentMarks(token, { studentId, term, year } = {}) {
  const qs = buildQuery({ student_id: studentId, term, year });
  return requestJson(`/api/parents/me/marks/${qs}`, token);
}

export function fetchParentSubmissions(token, { studentId } = {}) {
  const qs = buildQuery({ student_id: studentId });
  return requestJson(`/api/parents/me/submissions/${qs}`, token);
}

// ---------- Admin parent-linking endpoints ----------
export function fetchAdminParents(token, query = "") {
  const qs = buildQuery({ q: query });
  return requestJson(`/api/parents/admin/parents/${qs}`, token);
}

export function searchAdminStudents(token, query = "") {
  const qs = buildQuery({ q: query });
  return requestJson(`/api/parents/admin/students/${qs}`, token);
}

export function updateParentChildren(token, parentId, payload) {
  return mutateJson(`/api/parents/admin/${parentId}/children/`, token, payload);
}