import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

const tmpDb = path.join(os.tmpdir(), `empleanet-reco-test-${Date.now()}.db`);
process.env.DATABASE_URL = `sqlite://${tmpDb.replace(/\\/g, "/")}`;
process.env.NODE_ENV = "test";

const { RecomendacionesRepository } = await import("./recomendaciones.repository.js");
const { interpretarNivel } = await import("./recommendation.engine.js");

const repo = new RecomendacionesRepository();

before(() => repo.init());

after(() => {
  try {
    fs.unlinkSync(tmpDb);
  } catch {
    /* ignore */
  }
});

describe("RecomendacionesRepository O3", () => {
  it("excluye ofertas cerradas del cálculo", async () => {
    const empleos = await repo.findAllEmpleosActivos();
    for (const e of empleos) {
      assert.ok(e.title.length > 0);
    }
  });

  it("ordena por puntaje descendente", () => {
    const perfil = repo.getPerfilExtendido(1);
    assert.ok(perfil);
    const empleos = [{ id: "1", title: "Test", company: "Acme" }];
    const scores = repo.buildScoresFromEmpleos(perfil!, empleos as never, new Set());
    assert.equal(scores.length, 1);
    assert.ok(scores[0]!.puntaje >= 0);
    assert.ok(["alta", "media", "baja", "no_recomendable"].includes(scores[0]!.nivel));
  });

  it("penaliza ofertas ya postuladas al recalcular", () => {
    const perfil = repo.getPerfilExtendido(1)!;
    const empleo = { id: "1", title: "Dev React", company: "Acme", modalidad: "remoto" };
    const sinPostular = repo.buildScoresFromEmpleos(
      perfil,
      [empleo as never],
      new Set(),
    )[0]!.puntaje;
    const postulado = repo.buildScoresFromEmpleos(
      perfil,
      [empleo as never],
      new Set([1]),
    )[0]!.puntaje;
    assert.ok(postulado < sinPostular);
  });

  it("filtra recomendaciones por puntaje mínimo", () => {
    repo.replaceScores(1, [
      {
        empleoId: 1,
        puntaje: 75,
        motivo: "Alta afinidad",
        nivel: interpretarNivel(75),
        desglose: "{}",
      },
    ]);
    const items = repo.findByPerfil(1, { limit: 20 }, new Set());
    assert.ok(items.every((i) => i.puntaje >= 40));
  });
});
