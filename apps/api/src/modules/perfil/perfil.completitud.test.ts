import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calcularCompletitud } from "./perfil.completitud.js";

describe("calcularCompletitud", () => {
  it("perfil vacío tiene baja completitud", () => {
    const r = calcularCompletitud({
      nombre: "Ana",
      telefono: null,
      ubicacion: null,
      resumen: null,
      carreraId: null,
      cicloActual: null,
      anioEgreso: null,
      rol: "estudiante",
      skillsCount: 0,
      interesesCount: 0,
      experienciasCount: 0,
      tieneCv: false,
    });
    assert.ok(r.porcentaje < 80);
    assert.equal(r.completo, false);
    assert.ok(r.faltantes.length > 0);
  });

  it("perfil completo alcanza umbral", () => {
    const r = calcularCompletitud({
      nombre: "Ana",
      telefono: "999888777",
      ubicacion: "Lima",
      resumen: "Estudiante de software con experiencia en proyectos web.",
      carreraId: 1,
      cicloActual: 8,
      anioEgreso: null,
      rol: "estudiante",
      skillsCount: 4,
      interesesCount: 3,
      experienciasCount: 1,
      tieneCv: true,
    });
    assert.ok(r.porcentaje >= 80);
    assert.equal(r.completo, true);
    assert.equal(r.faltantes.length, 0);
  });
});
