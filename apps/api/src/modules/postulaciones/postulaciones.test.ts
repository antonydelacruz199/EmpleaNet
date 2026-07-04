import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

const testDir = mkdtempSync(join(tmpdir(), "empleanet-postulaciones-"));
const testDbPath = join(testDir, "postulaciones-test.db");

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = `sqlite:///${testDbPath.replace(/\\/g, "/")}`;
process.env.JWT_SECRET = "test-secret-minimum-16";

const { createApp } = await import("../../app.js");
const { getDb } = await import("../../core/db/conexion.js");

const app = createApp();
let baseUrl = "";
let token = "";

before(async () => {
  await new Promise<void>((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address();
      assert.ok(address && typeof address === "object");
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "estudiante@continental.edu.pe",
      password: "Continental2026",
    }),
  });
  const body = await login.json();
  token = body.token;

  await fetch(`${baseUrl}/api/perfil/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: "Estudiante Test",
      location: "Remoto",
      skills: ["typescript", "react"],
    }),
  });
});

after(() => {
  rmSync(testDir, { recursive: true, force: true });
});

async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  });
  const data = res.status === 204 ? null : await res.json();
  return { status: res.status, body: data };
}

function empleoPublicoId(): string {
  const row = getDb()
    .prepare(
      `SELECT id FROM empleo
       WHERE estado = 'publicada' AND activo = 1
       ORDER BY id LIMIT 1`,
    )
    .get() as { id: number } | undefined;
  assert.ok(row, "debe existir al menos una oferta publicada");
  return String(row.id);
}

describe("Postulaciones y favoritos API", () => {
  it("registra postulación válida", async () => {
    const empleoId = empleoPublicoId();
    getDb()
      .prepare("DELETE FROM postulacion WHERE empleo_id = ?")
      .run(Number(empleoId));

    const { status, body } = await api("/api/postulaciones", {
      method: "POST",
      body: JSON.stringify({ empleoId }),
    });
    assert.equal(status, 201);
    assert.equal(body.postulacion.empleoId, empleoId);
    assert.equal(body.postulacion.estado, "registrada");
    assert.ok(body.postulacion.fechaPostulacion);
  });

  it("rechaza postulación duplicada", async () => {
    const empleoId = empleoPublicoId();
    const first = await api("/api/postulaciones", {
      method: "POST",
      body: JSON.stringify({ empleoId }),
    });
    assert.equal(first.status, 201);

    const duplicate = await api("/api/postulaciones", {
      method: "POST",
      body: JSON.stringify({ empleoId }),
    });
    assert.equal(duplicate.status, 409);
    assert.match(duplicate.body.error ?? duplicate.body.message ?? "", /Ya registraste/i);
  });

  it("rechaza postulación a oferta cerrada", async () => {
    const row = getDb()
      .prepare(
        `SELECT id FROM empleo
         WHERE id NOT IN (SELECT empleo_id FROM postulacion)
         ORDER BY id DESC LIMIT 1`,
      )
      .get() as { id: number };
    const empleoId = String(row.id);

    getDb()
      .prepare("UPDATE empleo SET estado = 'cerrada', activo = 0 WHERE id = ?")
      .run(row.id);

    const { status, body } = await api("/api/postulaciones", {
      method: "POST",
      body: JSON.stringify({ empleoId }),
    });
    assert.equal(status, 422);
    assert.match(body.error ?? body.message ?? "", /cerrada/i);

    getDb()
      .prepare(
        `UPDATE empleo SET estado = 'publicada', activo = 1,
         fecha_cierre = date('now', '+30 days') WHERE id = ?`,
      )
      .run(row.id);
  });

  it("agrega favorito", async () => {
    const empleoId = empleoPublicoId();
    await api(`/api/favoritos/${empleoId}`, { method: "DELETE" }).catch(() => null);

    const { status, body } = await api("/api/favoritos", {
      method: "POST",
      body: JSON.stringify({ empleoId }),
    });
    assert.equal(status, 201);
    assert.equal(body.empleoId, empleoId);
    assert.ok(body.creadoEn);
  });

  it("elimina favorito", async () => {
    const empleoId = empleoPublicoId();
    await api("/api/favoritos", {
      method: "POST",
      body: JSON.stringify({ empleoId }),
    });

    const removed = await api(`/api/favoritos/${empleoId}`, { method: "DELETE" });
    assert.equal(removed.status, 204);

    const estado = await api(`/api/favoritos/empleo/${empleoId}`);
    assert.equal(estado.status, 200);
    assert.equal(estado.body.esFavorito, false);
  });

  it("devuelve historial de postulaciones ordenado", async () => {
    const empleoId = empleoPublicoId();
    getDb()
      .prepare("DELETE FROM postulacion WHERE empleo_id = ?")
      .run(Number(empleoId));
    await api("/api/postulaciones", {
      method: "POST",
      body: JSON.stringify({ empleoId }),
    });

    const { status, body } = await api("/api/postulaciones");
    assert.equal(status, 200);
    assert.ok(Array.isArray(body.postulaciones));
    assert.ok(body.postulaciones.length >= 1);
    assert.equal(body.postulaciones[0].empleoId, empleoId);

    const vista = await api("/api/seguimiento/vistas", {
      method: "POST",
      body: JSON.stringify({ empleoId }),
    });
    assert.equal(vista.status, 201);

    const resumen = await api("/api/seguimiento/resumen");
    assert.equal(resumen.status, 200);
    assert.ok(resumen.body.postulaciones >= 1);
    assert.ok(resumen.body.vistas >= 1);
  });
});
