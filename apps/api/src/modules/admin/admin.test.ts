import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

const testDir = mkdtempSync(join(tmpdir(), "empleanet-admin-"));
const testDbPath = join(testDir, "admin-test.db");

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = `sqlite:///${testDbPath.replace(/\\/g, "/")}`;
process.env.JWT_SECRET = "test-secret-minimum-16";

const { createApp } = await import("../../app.js");

const app = createApp();
let baseUrl = "";
let adminToken = "";
let studentToken = "";

before(async () => {
  await new Promise<void>((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address();
      assert.ok(address && typeof address === "object");
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });

  const adminLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@continental.edu.pe",
      password: "Continental2026",
    }),
  });
  adminToken = (await adminLogin.json()).token;

  const studentLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "estudiante@continental.edu.pe",
      password: "Continental2026",
    }),
  });
  studentToken = (await studentLogin.json()).token;
});

after(() => {
  rmSync(testDir, { recursive: true, force: true });
});

async function api(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  });
  const isCsv = res.headers.get("content-type")?.includes("text/csv");
  const data =
    res.status === 204 ? null : isCsv ? await res.text() : await res.json();
  return { status: res.status, body: data, headers: res.headers };
}

describe("Admin reportes API", () => {
  it("restringe acceso a estudiantes", async () => {
    const { status } = await api("/api/admin/reportes/kpis", studentToken);
    assert.equal(status, 403);
  });

  it("permite acceso al administrador", async () => {
    const { status, body } = await api("/api/admin/reportes/kpis", adminToken);
    assert.equal(status, 200);
    assert.ok(typeof body.usuariosActivos === "number");
    assert.ok(typeof body.tasaPerfilCompleto === "number");
  });

  it("calcula KPIs coherentes", async () => {
    const { body } = await api("/api/admin/reportes/kpis", adminToken);
    assert.ok(body.usuariosActivos >= 1);
    assert.ok(body.ofertasPublicadas >= 0);
    assert.ok(body.postulacionesRegistradas >= 0);
    assert.ok(body.recomendacionesGeneradas >= 0);
    if (body.ofertasPublicadas > 0) {
      assert.equal(
        body.tasaPostulacionPorOferta,
        Math.round((body.postulacionesRegistradas / body.ofertasPublicadas) * 100) /
          100,
      );
    }
  });

  it("filtra reporte de usuarios por rol", async () => {
    const all = await api("/api/admin/reportes/usuarios", adminToken);
    const filtered = await api(
      "/api/admin/reportes/usuarios?rol=estudiante",
      adminToken,
    );
    assert.equal(all.status, 200);
    assert.equal(filtered.status, 200);
    assert.ok(filtered.body.total <= all.body.total);
    assert.ok(
      filtered.body.items.every((u: { rol: string }) => u.rol === "estudiante"),
    );
  });

  it("exporta CSV con indicadores", async () => {
    const { status, body } = await api("/api/admin/reportes/export.csv", adminToken);
    assert.equal(status, 200);
    assert.match(String(body), /Usuarios activos/);
    assert.match(String(body), /Ofertas publicadas/);
  });

  it("exporta JSON descargable con secciones", async () => {
    const { status, body } = await api("/api/admin/reportes/export.json", adminToken);
    assert.equal(status, 200);
    assert.ok(body.kpis);
    assert.ok(Array.isArray(body.usuarios.items));
    assert.ok(body.generadoEn);
  });

  it("panel estratégico incluye incidencias y mejoras", async () => {
    const { status, body } = await api("/api/admin/estrategico/resumen", adminToken);
    assert.equal(status, 200);
    assert.ok(Array.isArray(body.usuariosPorRol));
    assert.ok(Array.isArray(body.mejorasSugeridas));
    assert.ok(body.mejorasSugeridas.length >= 1);
  });
});
