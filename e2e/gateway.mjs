// Minimal Supabase-compatible gateway for local E2E:
//   /rest/v1/*  -> PostgREST-subset translated to SQL (with RLS via set role +
//                  request.jwt.claims), covering exactly the query shapes the
//                  Act One apps produce via supabase-js.
//   /auth/v1/*  -> GoTrue-subset (user, token refresh, logout).
//   /e2e/*      -> test helpers (mint sessions).
// The Next.js apps run UNMODIFIED against this.
import http from "node:http";
import crypto from "node:crypto";
import pg from "pg";

const SECRET = "actone-e2e-secret-at-least-32-chars-long!!";
const PORT = 54321;
const pool = new pg.Pool({
  host: process.env.E2E_PGHOST ?? "127.0.0.1",
  port: Number(process.env.E2E_PGPORT ?? 55432),
  user: process.env.E2E_PGUSER ?? "authenticator",
  password: process.env.E2E_PGPASSWORD ?? "postgrest",
  database: process.env.E2E_PGDATABASE ?? "actone_e2e",
  max: 10,
});

// ---------- JWT (HS256) ----------
const b64u = (buf) => Buffer.from(buf).toString("base64url");
function sign(payload) {
  const h = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const p = b64u(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", SECRET).update(`${h}.${p}`).digest("base64url");
  return `${h}.${p}.${sig}`;
}
function verify(token) {
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) return null;
  const expect = crypto.createHmac("sha256", SECRET).update(`${h}.${p}`).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expect))) return null;
  const payload = JSON.parse(Buffer.from(p, "base64url").toString());
  if (payload.exp && payload.exp < Date.now() / 1000) return null;
  return payload;
}
export const ANON_KEY = sign({ role: "anon", iss: "e2e", iat: 0, exp: 4102444800 });

const refreshStore = new Map(); // refresh_token -> {sub, email}
function mintSession(sub, email) {
  const now = Math.floor(Date.now() / 1000);
  const access_token = sign({
    sub, email, role: "authenticated", aud: "authenticated",
    iat: now, exp: now + 86400, session_id: crypto.randomUUID(),
  });
  const refresh_token = `rt_${crypto.randomUUID()}`;
  refreshStore.set(refresh_token, { sub, email });
  return {
    access_token, token_type: "bearer", expires_in: 86400, expires_at: now + 86400,
    refresh_token, user: userObj(sub, email),
  };
}
function userObj(sub, email) {
  return {
    id: sub, aud: "authenticated", role: "authenticated", email: email ?? "",
    phone: "", app_metadata: { provider: "kakao", providers: ["kakao"] },
    user_metadata: {}, identities: [],
    created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z",
  };
}

// ---------- helpers ----------
const IDENT = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
function ident(name) {
  const n = name.trim();
  if (!IDENT.test(n)) throw new Error(`bad identifier: ${n}`);
  return `"${n}"`;
}
function splitTop(s) {
  const out = []; let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(" || ch === "{") depth++;
    if (ch === ")" || ch === "}") depth--;
    if (ch === "," && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  if (cur !== "") out.push(cur);
  return out;
}
const likePattern = (v) => v.replaceAll("*", "%");

function condSQL(col, op, value, values) {
  const c = ident(col);
  switch (op) {
    case "eq": values.push(value); return `${c} = $${values.length}`;
    case "neq": values.push(value); return `${c} <> $${values.length}`;
    case "gt": values.push(value); return `${c} > $${values.length}`;
    case "gte": values.push(value); return `${c} >= $${values.length}`;
    case "lt": values.push(value); return `${c} < $${values.length}`;
    case "lte": values.push(value); return `${c} <= $${values.length}`;
    case "like": values.push(likePattern(value)); return `${c} like $${values.length}`;
    case "ilike": values.push(likePattern(value)); return `${c} ilike $${values.length}`;
    case "is":
      if (value === "null") return `${c} is null`;
      if (value === "true" || value === "false") return `${c} is ${value}`;
      throw new Error("bad is filter");
    case "in": {
      const items = splitTop(value.replace(/^\(/, "").replace(/\)$/, ""))
        .map((v) => v.trim().replace(/^"(.*)"$/, "$1"));
      if (items.length === 0) return "false";
      const ph = items.map((v) => { values.push(v); return `$${values.length}`; });
      return `${c} in (${ph.join(",")})`;
    }
    case "cs": {
      const items = splitTop(value.replace(/^\{/, "").replace(/\}$/, ""))
        .map((v) => v.trim().replace(/^"(.*)"$/, "$1"));
      values.push(items);
      return `${c} @> $${values.length}::text[]`;
    }
    default: throw new Error(`unsupported op: ${op}`);
  }
}

function parseCond(raw, values) {
  // raw: col.op.value  (value may contain dots)
  const i1 = raw.indexOf(".");
  const rest = raw.slice(i1 + 1);
  const col = raw.slice(0, i1);
  const i2 = rest.indexOf(".");
  const op = i2 === -1 ? rest : rest.slice(0, i2);
  const value = i2 === -1 ? "" : rest.slice(i2 + 1);
  return condSQL(col, op, value, values);
}

const RESERVED = new Set(["select", "order", "limit", "offset", "on_conflict", "columns", "and", "or"]);

function buildWhere(sp, values) {
  const conds = [];
  for (const [key, value] of sp.entries()) {
    if (RESERVED.has(key)) continue;
    const dot = value.indexOf(".");
    const op = dot === -1 ? value : value.slice(0, dot);
    const v = dot === -1 ? "" : value.slice(dot + 1);
    conds.push(condSQL(key, op === "in" || op === "cs" || op === "is" ? op : op, v, values));
  }
  for (const orVal of sp.getAll("or")) {
    const inner = orVal.replace(/^\(/, "").replace(/\)$/, "");
    const parts = splitTop(inner).map((c) => parseCond(c.trim(), values));
    conds.push(`(${parts.join(" or ")})`);
  }
  return conds.length ? `where ${conds.join(" and ")}` : "";
}

function buildOrder(sp) {
  const order = sp.get("order");
  if (!order) return "";
  const parts = splitTop(order).map((seg) => {
    const bits = seg.trim().split(".");
    const col = ident(bits[0]);
    const dir = bits.includes("desc") ? "desc" : "asc";
    const nulls = bits.includes("nullsfirst") ? " nulls first" : bits.includes("nullslast") ? " nulls last" : "";
    return `${col} ${dir}${nulls}`;
  });
  return `order by ${parts.join(", ")}`;
}

function buildSelectCols(sp) {
  const sel = sp.get("select");
  if (!sel || sel === "*") return "*";
  return splitTop(sel).map((c) => ident(c)).join(", ");
}

async function withTx(claims, fn) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const role = claims?.role === "authenticated" ? "authenticated"
      : claims?.role === "service_role" ? "service_role" : "anon";
    await client.query(`set local role ${role}`);
    await client.query(
      "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', $2, true)",
      [JSON.stringify(claims ?? {}), claims?.sub ?? ""],
    );
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (e) {
    try { await client.query("rollback"); } catch {}
    throw e;
  } finally {
    client.release();
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString() || ""));
  });
}

function send(res, status, body, headers = {}) {
  const data = body === undefined ? "" : typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json", "access-control-allow-origin": "*", ...headers });
  res.end(data);
}

function pgError(res, e) {
  const status = e.code === "42501" ? 403 : 400;
  send(res, status, { code: e.code ?? "E2E00", message: e.message, details: e.detail ?? null, hint: e.hint ?? null });
}

// ---------- REST handler ----------
async function handleRest(req, res, url, claims) {
  const seg = url.pathname.replace(/^\/rest\/v1\//, "");
  const sp = url.searchParams;
  const prefer = (req.headers["prefer"] ?? "").toString();
  const wantRep = prefer.includes("return=representation");
  const wantCount = prefer.includes("count=exact");
  const wantMerge = prefer.includes("resolution=merge-duplicates");
  const acceptObject = (req.headers["accept"] ?? "").includes("vnd.pgrst.object");

  // RPC
  if (seg.startsWith("rpc/")) {
    const fn = seg.slice(4);
    if (!IDENT.test(fn)) return send(res, 404, { message: "bad rpc" });
    const args = req.method === "POST" ? JSON.parse((await readBody(req)) || "{}") : {};
    const keys = Object.keys(args);
    const values = keys.map((k) => args[k]);
    const argSql = keys.map((k, i) => `${ident(k).slice(1, -1)} => $${i + 1}`).join(", ");
    try {
      const { rows, fields } = await withTx(claims, (c) =>
        c.query(`select public.${ident(fn).slice(1, -1)}(${argSql}) as result`, values));
      const value = rows[0]?.result;
      if (fields[0]?.dataTypeID === 2278 /* void */ || value === undefined) return send(res, 204);
      return send(res, 200, JSON.stringify(value ?? null));
    } catch (e) { return pgError(res, e); }
  }

  if (!IDENT.test(seg)) return send(res, 404, { message: "bad table" });
  const table = `public.${ident(seg).slice(1, -1)}`;

  try {
    if (req.method === "GET" || req.method === "HEAD") {
      const values = [];
      const where = buildWhere(sp, values);
      const cols = buildSelectCols(sp);
      const order = buildOrder(sp);
      const limit = sp.get("limit") ? `limit ${parseInt(sp.get("limit"), 10)}` : "";
      const offset = sp.get("offset") ? `offset ${parseInt(sp.get("offset"), 10)}` : "";
      const dataSql = `select ${cols} from ${table} ${where} ${order} ${limit} ${offset}`;
      const countSql = `select count(*)::int as n from ${table} ${where}`;

      const { rows, count } = await withTx(claims, async (c) => {
        const rows = req.method === "HEAD" && wantCount ? [] : (await c.query(dataSql, values)).rows;
        const count = wantCount ? (await c.query(countSql, values)).rows[0].n : null;
        return { rows, count };
      });

      const off = sp.get("offset") ? parseInt(sp.get("offset"), 10) : 0;
      const headers = {};
      if (wantCount) {
        headers["content-range"] = rows.length
          ? `${off}-${off + rows.length - 1}/${count}` : `*/${count}`;
      }
      if (req.method === "HEAD") { res.writeHead(200, { "content-type": "application/json", ...headers }); return res.end(); }
      if (acceptObject) {
        if (rows.length !== 1) {
          return send(res, 406, {
            code: "PGRST116",
            message: "JSON object requested, multiple (or no) rows returned",
            details: `The result contains ${rows.length} rows`, hint: null,
          }, headers);
        }
        return send(res, 200, rows[0], headers);
      }
      return send(res, 200, rows, headers);
    }

    if (req.method === "POST") {
      const body = JSON.parse((await readBody(req)) || "[]");
      const rowsIn = Array.isArray(body) ? body : [body];
      if (rowsIn.length === 0) return send(res, 201, wantRep ? [] : undefined);
      const cols = Object.keys(rowsIn[0]);
      const values = [];
      const tuples = rowsIn.map((r) =>
        `(${cols.map((c) => { values.push(r[c] ?? null); return `$${values.length}`; }).join(",")})`);
      let sql = `insert into ${table} (${cols.map(ident).join(",")}) values ${tuples.join(",")}`;
      const onConflict = sp.get("on_conflict");
      if (wantMerge && onConflict) {
        const conflictCols = onConflict.split(",").map(ident).join(",");
        const sets = cols.map((c) => `${ident(c)} = excluded.${ident(c)}`).join(", ");
        sql += ` on conflict (${conflictCols}) do update set ${sets}`;
      }
      if (wantRep) sql += ` returning ${buildSelectCols(sp)}`;
      const { rows } = await withTx(claims, (c) => c.query(sql, values));
      if (!wantRep) return send(res, 201);
      if (acceptObject) {
        if (rows.length !== 1) return send(res, 406, { code: "PGRST116", message: "object requested", details: `${rows.length} rows`, hint: null });
        return send(res, 201, rows[0]);
      }
      return send(res, 201, rows);
    }

    if (req.method === "PATCH") {
      const body = JSON.parse((await readBody(req)) || "{}");
      const values = [];
      const sets = Object.keys(body).map((c) => { values.push(body[c]); return `${ident(c)} = $${values.length}`; });
      if (sets.length === 0) return send(res, 204);
      const where = buildWhere(sp, values);
      let sql = `update ${table} set ${sets.join(", ")} ${where}`;
      if (wantRep) sql += ` returning ${buildSelectCols(sp)}`;
      const { rows } = await withTx(claims, (c) => c.query(sql, values));
      if (!wantRep) return send(res, 204);
      return send(res, 200, rows);
    }

    if (req.method === "DELETE") {
      const values = [];
      const where = buildWhere(sp, values);
      let sql = `delete from ${table} ${where}`;
      if (wantRep) sql += ` returning ${buildSelectCols(sp)}`;
      const { rows } = await withTx(claims, (c) => c.query(sql, values));
      if (!wantRep) return send(res, 204);
      return send(res, 200, rows);
    }

    send(res, 405, { message: "method not allowed" });
  } catch (e) { pgError(res, e); }
}

// ---------- Auth handler ----------
async function handleAuth(req, res, url) {
  const path = url.pathname.replace(/^\/auth\/v1/, "");
  if (path === "/user" && req.method === "GET") {
    const token = (req.headers.authorization ?? "").replace(/^Bearer /, "");
    const claims = verify(token);
    if (!claims || claims.role !== "authenticated") {
      return send(res, 401, { code: 401, msg: "invalid token" });
    }
    return send(res, 200, userObj(claims.sub, claims.email));
  }
  if (path === "/token" && req.method === "POST") {
    const grant = url.searchParams.get("grant_type");
    const body = JSON.parse((await readBody(req)) || "{}");
    if (grant === "refresh_token") {
      const entry = refreshStore.get(body.refresh_token);
      if (!entry) return send(res, 400, { code: 400, msg: "invalid refresh token", error_code: "refresh_token_not_found" });
      refreshStore.delete(body.refresh_token);
      return send(res, 200, mintSession(entry.sub, entry.email));
    }
    return send(res, 400, { code: 400, msg: "unsupported grant" });
  }
  if (path === "/logout") return send(res, 204);
  send(res, 404, { message: "auth endpoint not implemented", path });
}

// ---------- server ----------
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "*",
      "access-control-allow-methods": "*",
    });
    return res.end();
  }
  try {
    if (url.pathname.startsWith("/rest/v1/")) {
      const token = (req.headers.authorization ?? "").replace(/^Bearer /, "");
      const claims = verify(token) ?? { role: "anon" };
      return await handleRest(req, res, url, claims);
    }
    if (url.pathname.startsWith("/auth/v1/")) return await handleAuth(req, res, url);
    if (url.pathname === "/e2e/anon") return send(res, 200, { anon_key: ANON_KEY });
    if (url.pathname === "/e2e/mint") {
      const sub = url.searchParams.get("sub");
      const email = url.searchParams.get("email") ?? "";
      if (!sub) return send(res, 400, { message: "sub required" });
      return send(res, 200, mintSession(sub, email));
    }
    if (url.pathname.startsWith("/storage/")) return send(res, 501, { message: "storage not emulated" });
    send(res, 404, { message: "not found" });
  } catch (e) {
    send(res, 500, { message: e.message });
  }
}).listen(PORT, "127.0.0.1", () => {
  console.log(`gateway on http://127.0.0.1:${PORT}`);
  console.log(`ANON_KEY=${ANON_KEY}`);
});
