import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

const tmpDb = path.join(os.tmpdir(), `empleanet-offers-test-${Date.now()}.db`);

process.env.DATABASE_URL = `sqlite://${tmpDb.replace(/\\/g, "/")}`;
process.env.NODE_ENV = "test";

const { OfertasRepository } = await import("./ofertas.repository.js");
const { syncOfertasVencidas } = await import("./ensureOffersSchema.js");
const { assertPuedePublicar } = await import("./ofertas.workflow.js");

const repo = new OfertasRepository();

function fuenteId(): number {
  const fuentes = repo.listFuentesAdmin();
  assert.ok(fuentes.length > 0, "debe existir al menos una fuente");
  return Number(fuentes[0]!.id);
}

function payloadValido() {
  const manana = new Date();
  manana.setDate(manana.getDate() + 30);
  return {
    title: "Práctica en Analítica",
    company: "Globex SA",
    fuenteId: fuenteId(),
    modalidad: "hibrido" as const,
    categoria: "negocios" as const,
    tipoOportunidad: "practica" as const,
    descripcion: "Oportunidad de práctica con acompañamiento institucional.",
    fechaCierre: manana.toISOString().slice(0, 10),
    habilidadesRequeridas: ["excel", "sql"],
  };
}

before(() => {
  repo.init();
});

after(() => {
  try {
    fs.unlinkSync(tmpDb);
  } catch {
    /* ignore */
  }
});

describe("OfertasRepository", () => {
  it("crea oferta válida en borrador", () => {
    const oferta = repo.create(payloadValido());
    assert.equal(oferta.estado, "borrador");
    assert.equal(oferta.activo, false);
  });

  it("impide publicar borrador sin validar", () => {
    const oferta = repo.create(payloadValido());
    assert.throws(() => assertPuedePublicar(oferta), /debe estar validada/);
  });

  it("publica tras validar con datos mínimos", () => {
    const creada = repo.create(payloadValido());
    repo.validar(Number(creada.id));
    const validada = repo.findById(Number(creada.id))!;
    assertPuedePublicar(validada);
    const publicada = repo.publicar(Number(creada.id));
    assert.equal(publicada.estado, "publicada");
    assert.equal(publicada.activo, true);
  });

  it("cierra ofertas vencidas automáticamente", () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const creada = repo.create({
      ...payloadValido(),
      title: "Oferta vencida test",
      fechaCierre: ayer.toISOString().slice(0, 10),
    });
    repo.validar(Number(creada.id));
    repo.publicar(Number(creada.id));
    syncOfertasVencidas();
    const cerrada = repo.findById(Number(creada.id))!;
    assert.equal(cerrada.estado, "cerrada");
    assert.equal(cerrada.activo, false);
  });

  it("filtra ofertas por estado", () => {
    repo.create({ ...payloadValido(), title: "Filtro borrador A" });
    const borradores = repo.listAdmin({ estado: "borrador" });
    assert.ok(borradores.every((o) => o.estado === "borrador"));
    assert.ok(borradores.length >= 1);
  });
});
