import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertPuedePublicar,
  assertPuedeValidar,
  isOfertaVencida,
  validarDatosMinimos,
} from "../ofertas.workflow.js";
import type { OfertaAdmin } from "../ofertas.schema.js";

function ofertaBase(partial: Partial<OfertaAdmin> = {}): OfertaAdmin {
  return {
    id: "1",
    title: "Desarrollador Frontend",
    company: "Acme Corp",
    fuenteId: "1",
    modalidad: "remoto",
    categoria: "tecnologia",
    tipoOportunidad: "empleo",
    fechaCierre: "2099-12-31",
    descripcion: "Descripción suficientemente larga para validar.",
    habilidadesRequeridas: ["javascript"],
    estado: "borrador",
    activo: false,
    vencida: false,
    ...partial,
  };
}

describe("validarDatosMinimos", () => {
  it("acepta oferta con datos mínimos completos", () => {
    const errores = validarDatosMinimos(ofertaBase());
    assert.equal(errores.length, 0);
  });

  it("rechaza oferta sin empresa ni fecha de cierre", () => {
    const errores = validarDatosMinimos(
      ofertaBase({ company: "", fechaCierre: undefined, descripcion: "corta" }),
    );
    assert.ok(errores.includes("Empresa"));
    assert.ok(errores.includes("Fecha de cierre"));
    assert.ok(errores.some((e) => e.includes("Descripción")));
  });
});

describe("assertPuedeValidar", () => {
  it("permite validar borrador con datos mínimos", () => {
    assert.doesNotThrow(() => assertPuedeValidar(ofertaBase()));
  });

  it("impide validar oferta ya publicada", () => {
    assert.throws(
      () => assertPuedeValidar(ofertaBase({ estado: "publicada" })),
      /Solo se validan ofertas/,
    );
  });
});

describe("assertPuedePublicar", () => {
  it("impide publicar borrador sin validar", () => {
    assert.throws(
      () => assertPuedePublicar(ofertaBase({ estado: "borrador" })),
      /debe estar validada/,
    );
  });

  it("permite publicar oferta validada", () => {
    assert.doesNotThrow(() =>
      assertPuedePublicar(ofertaBase({ estado: "validada" })),
    );
  });
});

describe("isOfertaVencida", () => {
  it("detecta fecha de cierre pasada", () => {
    assert.equal(isOfertaVencida("2000-01-01"), true);
    assert.equal(isOfertaVencida("2099-12-31"), false);
  });
});
