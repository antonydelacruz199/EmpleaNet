/**
 * Pruebas de humo — API Continental Oportunidades
 * Requiere API en ejecución: pnpm dev:api
 *
 * Uso: node scripts/smoke-test.mjs
 */

const API = process.env.API_URL ?? "http://localhost:4000";

async function check(name, fn) {
  try {
    await fn();
    console.log(`OK  ${name}`);
    return true;
  } catch (err) {
    console.error(`FAIL ${name}:`, err instanceof Error ? err.message : err);
    return false;
  }
}

async function json(path, options = {}) {
  const res = await fetch(`${API}${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

let token = "";

const results = [];

results.push(
  await check("GET /api/health", async () => {
    const data = await json("/api/health");
    if (data.status !== "ok") throw new Error("status != ok");
  }),
);

results.push(
  await check("POST /api/auth/login estudiante", async () => {
    const data = await json("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "estudiante@continental.edu.pe",
        password: "Continental2026",
      }),
    });
    token = data.token;
    if (!token) throw new Error("sin token");
  }),
);

results.push(
  await check("GET /api/empleos", async () => {
    const data = await json("/api/empleos?limit=5");
    if (!Array.isArray(data.empleos)) throw new Error("sin empleos");
  }),
);

results.push(
  await check("GET /api/recomendaciones", async () => {
    await json("/api/recomendaciones?limit=3", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }),
);

results.push(
  await check("POST /api/auth/login admin", async () => {
    const data = await json("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@continental.edu.pe",
        password: "Continental2026",
      }),
    });
    token = data.token;
  }),
);

results.push(
  await check("GET /api/admin/reportes/resumen", async () => {
    await json("/api/admin/reportes/resumen", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }),
);

results.push(
  await check("POST /api/auth/login soporte", async () => {
    const data = await json("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "soporte@continental.edu.pe",
        password: "Continental2026",
      }),
    });
    token = data.token;
  }),
);

results.push(
  await check("GET /api/soporte/motor/config", async () => {
    const data = await json("/api/soporte/motor/config", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (typeof data.habilidades !== "number") throw new Error("config inválida");
  }),
);

const passed = results.filter(Boolean).length;
const total = results.length;
console.log(`\n${passed}/${total} pruebas OK`);
process.exit(passed === total ? 0 : 1);
