const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const FUNCTION_URL = SUPABASE_URL ? \`\${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/dashboard\` : "";
const TOKEN_KEY = "qpd_access_token";

export function saveAccessToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}
export function clearAccessToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}
export async function apiRequest(action: string, payload: Record<string, unknown> = {}, authenticated = true) {
  if (!FUNCTION_URL) throw new Error("Supabase URL is not configured.");
  const token = sessionStorage.getItem(TOKEN_KEY);
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(publishableKey ? { apikey: publishableKey } : {}),
      ...(authenticated && token ? { Authorization: \`Bearer \${token}\` } : {}),
    },
    body: JSON.stringify({ action, ...payload }),
  });
  return response;
}
