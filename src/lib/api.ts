const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard`;
const TOKEN_KEY = "qpd_access_token";

export function saveAccessToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}
export function clearAccessToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}
export async function apiRequest(action: string, payload: Record<string, unknown> = {}, authenticated = true) {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(import.meta.env.VITE_SUPABASE_ANON_KEY ? { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY } : {}),
      ...(authenticated && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ action, ...payload }),
  });
  return response;
}
