import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

const testDir = mkdtempSync(join(tmpdir(), "empleanet-auth-"));
const testDbPath = join(testDir, "auth-test.db");

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = `sqlite:///${testDbPath.replace(/\\/g, "/")}`;
process.env.JWT_SECRET = "test-secret-minimum-16";

const { createApp } = await import("../../app.js");

const app = createApp();
let baseUrl = "";

before(async () => {
  await new Promise<void>((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address();
      assert.ok(address && typeof address === "object");
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(() => {
  rmSync(testDir, { recursive: true, force: true });
});

async function jsonFetch(
  path: string,
  options: RequestInit & { token?: string } = {},
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });
  const body = res.status === 204 ? null : await res.json();
  return { status: res.status, body };
}

describe("Auth API", () => {
  it("login correcto con usuario demo", async () => {
    const { status, body } = await jsonFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "estudiante@continental.edu.pe",
        password: "Continental2026",
      }),
    });
    assert.equal(status, 200);
    assert.ok(body.token);
    assert.equal(body.user.rol, "estudiante");
    assert.equal(body.user.perfilCompleto, true);
  });

  it("login incorrecto devuelve 401", async () => {
    const { status } = await jsonFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "estudiante@continental.edu.pe",
        password: "clave-incorrecta",
      }),
    });
    assert.equal(status, 401);
  });

  it("registro crea sesión con perfil incompleto", async () => {
    const email = `nuevo.${Date.now()}@continental.edu.pe`;
    const { status, body } = await jsonFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password: "NuevaClave1",
        confirmPassword: "NuevaClave1",
        name: "Usuario Nuevo",
        rol: "estudiante",
      }),
    });
    assert.equal(status, 201);
    assert.ok(body.token);
    assert.equal(body.user.perfilCompleto, false);
  });

  it("acceso protegido sin token devuelve 401", async () => {
    const { status } = await jsonFetch("/api/auth/me");
    assert.equal(status, 401);
  });

  it("restricción por rol en admin", async () => {
    const login = await jsonFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "estudiante@continental.edu.pe",
        password: "Continental2026",
      }),
    });
    const { status } = await jsonFetch("/api/admin/reportes/resumen", {
      token: login.body.token,
    });
    assert.equal(status, 403);
  });
});
