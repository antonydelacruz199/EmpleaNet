import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HttpError } from "../../core/http/clienteHttp";
import {
  fetchMotorConfig,
  recalcularMotor,
  updateMotorConfig,
} from "./api";
import type { MotorConfig, MotorConfigInput } from "./tipos";

const CAMPOS: { key: keyof MotorConfigInput; label: string }[] = [
  { key: "habilidades", label: "Habilidades" },
  { key: "carrera", label: "Carrera / título" },
  { key: "experiencia", label: "Experiencia" },
  { key: "modalidad", label: "Modalidad" },
  { key: "ubicacion", label: "Ubicación" },
  { key: "actualidad", label: "Actualidad" },
];

export function SoporteMotorPage() {
  const [config, setConfig] = useState<MotorConfigInput | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    void fetchMotorConfig()
      .then((data) => {
        setConfig({
          habilidades: data.habilidades,
          carrera: data.carrera,
          experiencia: data.experiencia,
          modalidad: data.modalidad,
          ubicacion: data.ubicacion,
          actualidad: data.actualidad,
        });
      })
      .catch(() => setMensaje("No se pudo cargar la configuración del motor."))
      .finally(() => setCargando(false));
  }, []);

  const total = config
    ? CAMPOS.reduce((sum, c) => sum + config[c.key], 0)
    : 0;

  function actualizarCampo(key: keyof MotorConfigInput, value: number) {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleGuardar() {
    if (!config) return;
    setGuardando(true);
    setMensaje(null);
    try {
      await updateMotorConfig(config);
      setMensaje("Configuración guardada.");
    } catch (err) {
      setMensaje(err instanceof HttpError ? err.message : "Error al guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleRecalcular() {
    setGuardando(true);
    setMensaje(null);
    try {
      const result = await recalcularMotor();
      setMensaje(`Recomendaciones recalculadas para ${result.perfilesRecalculados} perfiles.`);
    } catch {
      setMensaje("No se pudo ejecutar el recálculo global.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Configuración del motor</h1>
        <p>
          Ajuste de ponderaciones del motor de recomendación por reglas (Bizagi S2).
          La suma debe ser 100.
        </p>
      </header>

      <div className="section-heading">
        <Link to="/soporte/incidencias">Incidencias y auditoría →</Link>
      </div>

      {cargando ? (
        <p className="loading">Cargando configuración...</p>
      ) : config ? (
        <section className="card detail-main admin-form-card">
          <div className="admin-form__grid">
            {CAMPOS.map(({ key, label }) => (
              <label key={key}>
                {label}
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={config[key]}
                  onChange={(e) => actualizarCampo(key, Number(e.target.value))}
                />
              </label>
            ))}
          </div>
          <p className={`motor-total${Math.abs(total - 100) > 0.01 ? " motor-total--error" : ""}`}>
            Total: {total.toFixed(0)} / 100
          </p>
          <div className="modal__actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={guardando || Math.abs(total - 100) > 0.01}
              onClick={() => void handleGuardar()}
            >
              {guardando ? "Guardando..." : "Guardar ponderaciones"}
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              disabled={guardando}
              onClick={() => void handleRecalcular()}
            >
              Recalcular recomendaciones
            </button>
          </div>
          {mensaje ? (
            <p className="detail-actions__msg" role="status">
              {mensaje}
            </p>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
