import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calcularRecomendacion,
  interpretarNivel,
  PESOS_O3,
} from "./recommendation.engine.js";

describe("interpretarNivel", () => {
  it("clasifica rangos O3", () => {
    assert.equal(interpretarNivel(85), "alta");
    assert.equal(interpretarNivel(70), "media");
    assert.equal(interpretarNivel(50), "baja");
    assert.equal(interpretarNivel(20), "no_recomendable");
  });
});

describe("calcularRecomendacion", () => {
  const perfil = {
    skills: ["javascript", "react", "typescript"],
    carrera: "ingenieria de sistemas",
    intereses: ["tecnologia", "empleo"],
    location: "lima remoto",
    modalidadPreferida: "remoto" as const,
    ubicacionPreferida: "lima",
    anosExperiencia: 1,
    categoriasInteres: ["tecnologia"],
  };

  it("prioriza coincidencia por habilidades", () => {
    const alto = calcularRecomendacion(
      perfil,
      {
        title: "Desarrollador React TypeScript",
        descripcion: "Buscamos javascript react typescript en equipo ágil",
        modalidad: "remoto",
        ubicacion: "Lima - remoto",
        categoria: "tecnologia",
        tipoOportunidad: "empleo",
        habilidadesRequeridas: ["react", "typescript"],
      },
      PESOS_O3,
    );
    const bajo = calcularRecomendacion(
      perfil,
      {
        title: "Contador senior",
        descripcion: "Experiencia en contabilidad financiera",
        modalidad: "presencial",
        ubicacion: "Arequipa",
        categoria: "negocios",
      },
      PESOS_O3,
    );
    assert.ok(alto.puntaje > bajo.puntaje);
    assert.ok(alto.desglose.habilidades > bajo.desglose.habilidades);
  });

  it("considera afinidad de carrera", () => {
    const result = calcularRecomendacion(
      { ...perfil, skills: ["sistemas"] },
      {
        title: "Ingeniería de sistemas — practicante",
        descripcion: "Práctica para estudiantes de sistemas",
        categoria: "tecnologia",
        tipoOportunidad: "practica",
      },
      PESOS_O3,
    );
    assert.ok(result.desglose.carrera > 0);
  });

  it("genera explicación con razones", () => {
    const result = calcularRecomendacion(
      perfil,
      {
        title: "Frontend React",
        descripcion: "javascript react remoto",
        modalidad: "remoto",
        categoria: "tecnologia",
      },
      PESOS_O3,
    );
    assert.ok(result.razones.length > 0);
    assert.ok(result.motivo.length > 10);
  });

  it("puntaje máximo no supera 100", () => {
    const result = calcularRecomendacion(
      perfil,
      {
        title: "React TypeScript javascript remoto Lima tecnologia",
        descripcion: "javascript react typescript ingenieria sistemas",
        modalidad: "remoto",
        ubicacion: "Lima remoto",
        categoria: "tecnologia",
        tipoOportunidad: "practica",
        habilidadesRequeridas: ["react", "typescript", "javascript"],
      },
      PESOS_O3,
    );
    assert.ok(result.puntaje <= 100);
  });
});
