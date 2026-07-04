import { FormEvent, useEffect, useState } from "react";
import { deleteCv, downloadCvBlob, fetchPerfil, uploadCv } from "./api";
import { CompletitudBar, PerfilNav } from "./PerfilNav";
import type { PerfilDetalle } from "./tipos";

export function PerfilCvPage() {
  const [perfil, setPerfil] = useState<PerfilDetalle | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchPerfil()
      .then(setPerfil)
      .catch(() => setError("Error al cargar CV."));
  }, []);

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem(
      "cv-file",
    ) as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      setError("Selecciona un archivo.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("El archivo no puede superar 2 MB.");
      return;
    }
    try {
      const p = await uploadCv(file);
      setPerfil(p);
      setMensaje("CV cargado correctamente.");
      setError(null);
      input.value = "";
    } catch {
      setError("No se pudo subir el CV.");
    }
  }

  async function onDelete() {
    try {
      const p = await deleteCv();
      setPerfil(p);
      setMensaje("CV eliminado.");
    } catch {
      setError("No se pudo eliminar el CV.");
    }
  }

  async function onDownload() {
    try {
      const blob = await downloadCvBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = perfil?.cv?.nombre ?? "cv.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("No se pudo descargar el CV.");
    }
  }

  if (!perfil && !error) return <p className="loading">Cargando...</p>;

  return (
    <>
      <header className="page-header">
        <h1>Currículum vitae</h1>
        <p>Sube tu CV en PDF, DOC o DOCX (máx. 2 MB).</p>
      </header>
      <PerfilNav />
      {perfil ? (
        <CompletitudBar
          porcentaje={perfil.completitud.porcentaje}
          completo={perfil.completitud.completo}
        />
      ) : null}
      {error ? <p className="alert">{error}</p> : null}
      {mensaje ? <p className="alert alert--success">{mensaje}</p> : null}

      {perfil?.cv ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <p>
            Archivo actual: <strong>{perfil.cv.nombre}</strong>
          </p>
          <div className="btn-row">
            <button type="button" className="btn btn--secondary" onClick={() => void onDownload()}>
              Descargar
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => void onDelete()}>
              Eliminar
            </button>
          </div>
        </div>
      ) : null}

      <form className="card form-card" onSubmit={onUpload}>
        <div className="field">
          <label htmlFor="cv-file">Seleccionar archivo</label>
          <input id="cv-file" name="cv-file" type="file" accept=".pdf,.doc,.docx" />
        </div>
        <button type="submit" className="btn btn--primary">
          {perfil?.cv ? "Actualizar CV" : "Subir CV"}
        </button>
      </form>
    </>
  );
}
