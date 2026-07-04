import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

const testDir = mkdtempSync(join(tmpdir(), "empleanet-perfil-"));
const testDbPath = join(testDir, "perfil-test.db");

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = `sqlite:///${testDbPath.replace(/\\/g, "/")}`;
process.env.JWT_SECRET = "test-secret-minimum-16";

const { createApp } = await import("../../app.js");
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

describe("Perfil API", () => {
  it("obtiene perfil con completitud", async () => {
    const { status, body } = await api("/api/perfil/me");
    assert.equal(status, 200);
    assert.ok(body.completitud);
    assert.ok(Array.isArray(body.skills));
  });

  it("edita perfil personal", async () => {
    const { status, body } = await api("/api/perfil/me", {
      method: "PUT",
      body: JSON.stringify({
        name: "Estudiante Actualizado",
        telefono: "999111222",
        resumen: "Perfil de prueba con resumen profesional extendido.",
        location: "Remoto",
        carreraId: 1,
        cicloActual: 7,
      }),
    });
    assert.equal(status, 200);
    assert.equal(body.name, "Estudiante Actualizado");
    assert.ok(body.completitud.porcentaje > 0);
  });

  it("agrega habilidades", async () => {
    const { status, body } = await api("/api/perfil/me/habilidades", {
      method: "PUT",
      body: JSON.stringify({
        skills: ["typescript", "react", "nodejs"],
      }),
    });
    assert.equal(status, 200);
    assert.equal(body.skills.length, 3);
  });

  it("actualiza intereses", async () => {
    const { status, body } = await api("/api/perfil/me/intereses", {
      method: "PUT",
      body: JSON.stringify({
        intereses: ["Desarrollo web", "Remoto"],
      }),
    });
    assert.equal(status, 200);
    assert.equal(body.intereses.length, 2);
  });

  it("endpoint de completitud", async () => {
    const { status, body } = await api("/api/perfil/me/completitud");
    assert.equal(status, 200);
    assert.ok(typeof body.porcentaje === "number");
    assert.ok(body.secciones);
  });
});
