const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SECRET_KEY = (() => {
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    return keys.default ?? "";
  } catch {
    return "";
  }
})();
const SESSION_SECRET = Deno.env.get("SESSION_SECRET") ?? "";
const INITIAL_ADMIN_PASSWORD = Deno.env.get("INITIAL_ADMIN_PASSWORD") ?? "";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const INITIAL_ADMIN_USERNAME = Deno.env.get("INITIAL_ADMIN_USERNAME") || "Dawy";
const INITIAL_ADMIN_NAME = Deno.env.get("INITIAL_ADMIN_NAME") || "Mohamed Eldawy";

type PublicUser = { id: string; username: string; name: string; role: string; color: string; photoUrl: string };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function db(table: string, query = "", init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Database request failed (${response.status}): ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

function toPublicUser(user: any): PublicUser {
  return { id: user.id, username: user.username, name: user.name, role: user.role, color: user.color, photoUrl: user.photo_url || "" };
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function hexToBytes(hex: string) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2) throw new Error("Invalid hex");
  return new Uint8Array(hex.match(/.{2}/g)!.map((part) => parseInt(part, 16)));
}
function base64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => binary += String.fromCharCode(byte));
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function randomBytes(length: number) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}
async function passwordHash(password: string) {
  const salt = randomBytes(16);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 310000 }, key, 256);
  return `pbkdf2$310000$${bytesToHex(salt)}$${bytesToHex(new Uint8Array(bits))}`;
}
async function verifyPassword(password: string, stored: string) {
  const [scheme, iterationText, saltHex, hashHex] = (stored || "").split("$");
  if (scheme !== "pbkdf2" || !saltHex || !hashHex) return false;
  const iterations = Number(iterationText);
  if (!Number.isInteger(iterations) || iterations < 100000 || iterations > 1000000) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: hexToBytes(saltHex), iterations }, key, hashHex.length * 4);
  const actual = new Uint8Array(bits);
  const expected = hexToBytes(hashHex);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}
async function hmac(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToHex(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}
function bearer(req: Request) {
  const header = req.headers.get("Authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}
async function sessionUser(req: Request): Promise<PublicUser | null> {
  const token = bearer(req);
  if (!token) return null;
  const tokenHash = await hmac(token);
  const sessions = await db("dashboard_sessions", `select=user_id,expires_at&token_hash=eq.${tokenHash}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&limit=1`);
  if (!sessions?.length) return null;
  const users = await db("dashboard_users", `select=id,username,name,role,color,photo_url&id=eq.${encodeURIComponent(sessions[0].user_id)}&limit=1`);
  return users?.[0] ? toPublicUser(users[0]) : null;
}
async function ensureInitialized() {
  const users = await db("dashboard_users", "select=id&limit=1");
  if (!users?.length) {
    if (!INITIAL_ADMIN_PASSWORD || INITIAL_ADMIN_PASSWORD.length < 12) {
      throw new Error("Set INITIAL_ADMIN_PASSWORD to a new password of at least 12 characters before first use.");
    }
    await db("dashboard_users", "", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify([{
        id: "user-manager",
        username: INITIAL_ADMIN_USERNAME,
        name: INITIAL_ADMIN_NAME,
        role: "Quality Manager",
        color: "bg-indigo-600",
        photo_url: null,
        password_hash: await passwordHash(INITIAL_ADMIN_PASSWORD),
      }]),
    });
  }
  const state = await db("dashboard_state", "select=id&id=eq.1&limit=1");
  if (!state?.length) {
    const { INITIAL_MEMBERS } = await import("../_shared/initialData.ts");
    await db("dashboard_state", "", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify([{
        id: 1,
        data: { members: INITIAL_MEMBERS, activeMemberId: INITIAL_MEMBERS[0]?.id || "m1" },
        version: 1,
        updated_by: "النظام",
      }]),
    });
  }
}
async function requireUser(req: Request) {
  const user = await sessionUser(req);
  if (!user) throw Object.assign(new Error("يرجى تسجيل الدخول مرة أخرى"), { status: 401 });
  return user;
}
function requireManager(user: PublicUser) {
  if (user.role !== "Quality Manager") throw Object.assign(new Error("غير مصرح بهذه العملية"), { status: 403 });
}
async function readDashboard() {
  const rows = await db("dashboard_state", "select=data,version,updated_by,updated_at&id=eq.1&limit=1");
  const saved = rows?.[0];
  const users = await db("dashboard_users", "select=id,username,name,role,color,photo_url&order=created_at.asc");
  return {
    members: Array.isArray(saved?.data?.members) ? saved.data.members : [],
    activeMemberId: saved?.data?.activeMemberId || "m1",
    version: Number(saved?.version || 1),
    lastUpdatedBy: saved?.updated_by || "النظام",
    lastUpdatedAt: saved?.updated_at ? new Date(saved.updated_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "الآن",
    users: (users || []).map(toPublicUser),
  };
}
async function writeDashboard(body: any, user: PublicUser) {
  if (!Array.isArray(body?.members)) throw Object.assign(new Error("بيانات الداشبورد غير صالحة"), { status: 400 });
  const current = await db("dashboard_state", "select=version&id=eq.1&limit=1");
  const version = Number(current?.[0]?.version || 1);
  const updatedAt = new Date().toISOString();
  const payload = {
    data: { members: body.members, activeMemberId: String(body.activeMemberId || body.members[0]?.id || "m1") },
    version: version + 1,
    updated_by: user.name,
    updated_at: updatedAt,
  };
  const updated = await db("dashboard_state", `id=eq.1&version=eq.${version}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  if (!updated?.length) throw Object.assign(new Error("تم تعديل البيانات من مستخدم آخر. حدّث الصفحة وحاول مرة أخرى."), { status: 409 });
  return { success: true, version: version + 1, lastUpdatedBy: user.name, lastUpdatedAt: new Date(updatedAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || SESSION_SECRET.length < 32) return json({ success: false, error: "خدمة قاعدة البيانات غير مكتملة الإعداد." }, 503);
  let action = "";
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    action = String(body.action || new URL(req.url).searchParams.get("action") || "");
    if (action === "login") {
      await ensureInitialized();
      const username = String(body.username || "").trim();
      const password = String(body.password || "");
      if (!username || !password) return json({ success: false, error: "يرجى إدخال اسم المستخدم وكلمة المرور" }, 400);
      const users = await db("dashboard_users", `select=id,username,name,role,color,photo_url,password_hash&username=ilike.${encodeURIComponent(username)}&limit=1`);
      const user = users?.[0];
      if (!user || !(await verifyPassword(password, user.password_hash))) return json({ success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, 401);
      const token = base64Url(randomBytes(32));
      await db("dashboard_sessions", "", {
        method: "POST", headers: { Prefer: "return=minimal" },
        body: JSON.stringify([{ token_hash: await hmac(token), user_id: user.id, expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString() }]),
      });
      return json({ success: true, token, user: toPublicUser(user) });
    }
    if (action === "session") {
      const user = await requireUser(req);
      return json({ success: true, user });
    }
    if (action === "logout") {
      const token = bearer(req);
      if (token) await db("dashboard_sessions", `token_hash=eq.${await hmac(token)}`, { method: "DELETE" });
      return json({ success: true });
    }
    if (action === "image-upload") {
      const user = await requireUser(req);
      try {
      const dataUrl = String(body.dataUrl || "");
      const folder = body.folder === "users" ? "users" : "members";
      const match = dataUrl.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
      if (!match) return json({ success: false, error: "صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WEBP." }, 400);
      const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
      if (bytes.byteLength > 700 * 1024) return json({ success: false, error: "حجم الصورة بعد الضغط أكبر من 700KB." }, 413);
      const bucket = "quality-dashboard-images";
      const storageHeaders = { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}`, "Content-Type": "application/json" };
      const existingBucket = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${bucket}`, { headers: storageHeaders });
      if (!existingBucket.ok && existingBucket.status === 404) {
        const bucketResponse = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
          method: "POST",
          headers: storageHeaders,
          body: JSON.stringify({ id: bucket, name: bucket, public: true, file_size_limit: 1048576, allowed_mime_types: ["image/jpeg", "image/png", "image/webp"] }),
        });
        if (!bucketResponse.ok) {
          const details = await bucketResponse.text();
          if (!/already exists|duplicate/i.test(details)) throw new Error(`تعذر تجهيز مساحة الصور (${bucketResponse.status}): ${details.slice(0, 220)}`);
        }
      } else if (!existingBucket.ok) {
        throw new Error(`تعذر التحقق من مساحة الصور (${existingBucket.status}): ${(await existingBucket.text()).slice(0, 220)}`);
      }
      const extension = match[1] === "jpeg" ? "jpg" : match[1];
      const objectPath = `${folder}/${crypto.randomUUID()}.${extension}`;
      const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${objectPath}`, {
        method: "POST",
        headers: { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}`, "Content-Type": `image/${match[1]}`, "x-upsert": "true" },
        body: bytes,
      });
      if (!upload.ok) throw new Error(`فشل رفع الصورة إلى Storage (${upload.status}): ${(await upload.text()).slice(0, 180)}`);
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${objectPath}`;
      // Supabase Storage upload success is authoritative. Some gateways/CDNs
      // reject HEAD requests for public objects even when GET works correctly.
      return json({ success: true, publicUrl, uploadedBy: user.id });
      } catch (error) {
        const message = error instanceof Error ? error.message : "تعذر رفع الصورة";
        console.error("[image-upload]", message);
        return json({ success: false, error: message }, 502);
      }
    }
    const user = await requireUser(req);
    if (action === "dashboard-read") return json({ success: true, data: await readDashboard() });
    if (action === "dashboard-write") return json(await writeDashboard(body, user));
    if (action === "users-save") {
      requireManager(user);
      const u = body.user;
      if (!u?.name?.trim() || !u?.username?.trim()) return json({ success: false, error: "الاسم واسم المستخدم مطلوبان" }, 400);
      const id = String(u.id || `user-${crypto.randomUUID()}`);
      const existing = await db("dashboard_users", `select=id&id=eq.${encodeURIComponent(id)}&limit=1`);
      const payload: any = {
        username: String(u.username).trim(), name: String(u.name).trim(),
        role: String(u.role || "Quality Engineer"), color: String(u.color || "bg-indigo-600"),
        photo_url: u.photoUrl || null, updated_at: new Date().toISOString(),
      };
      if (u.password) payload.password_hash = await passwordHash(String(u.password));
      if (existing?.length) {
        // Update the existing row only. Do not run an UPSERT that attempts an
        // INSERT with a missing NOT NULL password_hash.
        await db("dashboard_users", `id=eq.${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify(payload),
        });
      } else {
        if (!payload.password_hash) return json({ success: false, error: "كلمة المرور مطلوبة للمستخدم الجديد" }, 400);
        await db("dashboard_users", "", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify([{ id, ...payload }]),
        });
      }
      return json({ success: true, users: (await db("dashboard_users", "select=id,username,name,role,color,photo_url&order=created_at.asc")).map(toPublicUser) });
    }
    if (action === "users-delete") {
      requireManager(user);
      const id = String(body.id || "");
      if (!id || id === user.id) return json({ success: false, error: "لا يمكنك حذف حسابك الحالي" }, 400);
      await db("dashboard_users", `id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      return json({ success: true });
    }
    if (action === "reset") {
      requireManager(user);
      const { INITIAL_MEMBERS } = await import("../_shared/initialData.ts");
      const current = await db("dashboard_state", "select=version&id=eq.1&limit=1");
      const version = Number(current?.[0]?.version || 1);
      const updated = await db("dashboard_state", `id=eq.1&version=eq.${version}`, {
        method: "PATCH", headers: { Prefer: "return=representation" },
        body: JSON.stringify({ data: { members: INITIAL_MEMBERS, activeMemberId: INITIAL_MEMBERS[0]?.id || "m1" }, version: version + 1, updated_by: user.name, updated_at: new Date().toISOString() }),
      });
      if (!updated?.length) return json({ success: false, error: "تعذر الاستعادة بسبب تعديل متزامن. حدّث الصفحة وحاول مرة أخرى." }, 409);
      return json({ success: true, data: await readDashboard() });
    }
    return json({ success: false, error: "طلب غير معروف" }, 404);
  } catch (error) {
    const status = Number((error as any)?.status || 500);
    const message = error instanceof Error ? error.message : String(error);
    if (status >= 500) console.error(`[dashboard:${action || "unknown"}]`, message);
    // Return a useful, action-scoped error for user profile saves so the UI
    // can show the actual database constraint/column issue instead of a generic 500.
    const safeError = action === "users-save" && status >= 500
      ? `فشل حفظ بيانات المستخدم: ${message.slice(0, 260)}`
      : status === 500 ? "حدث خطأ في الخدمة. حاول مرة أخرى." : message;
    return json({ success: false, error: safeError }, status);
  }
});
