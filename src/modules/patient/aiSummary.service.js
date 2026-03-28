import config from "../../config/index.js";

const AI_BASE = `${config.aiSummarizerUrl}/api/v1`;

/**
 * Proxy helper — forward a GET request to the AI Summarizer with the caller's
 * Authorization header so the shared JWT is passed through transparently.
 */
async function aiGet(path, authHeader) {
  const res = await fetch(`${AI_BASE}${path}`, {
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
    },
  });

  const body = await res.json();
  if (!res.ok) {
    const message = body?.detail ?? body?.message ?? "AI Summarizer request failed";
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return body;
}

/**
 * Fetch the AI-generated doctor summary for a patient.
 * GET /api/v1/patients/{patientId}/summary
 */
export async function getPatientAiSummary(patientId, authHeader) {
  return aiGet(`/patients/${patientId}/summary`, authHeader);
}

/**
 * Fetch the lab report (grouped) for a patient.
 * GET /api/v1/patients/{patientId}/lab-report
 */
export async function getPatientLabReport(patientId, authHeader) {
  return aiGet(`/patients/${patientId}/lab-report`, authHeader);
}

/**
 * Fetch the clinical timeline for a patient.
 * GET /api/v1/patients/{patientId}/timeline?view={view}&limit={limit}&offset={offset}
 */
export async function getPatientTimeline(patientId, { view, limit = 20, offset = 0 }, authHeader) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (view) params.set("view", view);
  return aiGet(`/patients/${patientId}/timeline?${params}`, authHeader);
}
