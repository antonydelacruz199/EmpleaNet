import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchUsuariosAdmin } from "../perfil/api";
import type { UsuarioPerfilResumen } from "../perfil/tipos";

export function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioPerfilResumen[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchUsuariosAdmin()
      .then(setUsuarios)
      .catch(() => setError("No se pudo cargar la lista de usuarios."));
  }, []);

  if (error) return <p className="alert">{error}</p>;
  if (usuarios.length === 0) return <p className="loading">Cargando usuarios...</p>;

  return (
    <>
      <header className="page-header">
        <h1>Usuarios y perfiles</h1>
        <p>Vista institucional de perfiles estudiantiles y egresados.</p>
      </header>
      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Completitud</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.rol}</td>
                <td>
                  <span className={u.perfilCompleto ? "badge badge--ok" : "badge badge--warn"}>
                    {u.completitudPct}%
                  </span>
                </td>
                <td>
                  <Link to={`/admin/usuarios/${u.id}`} className="btn btn--secondary btn--sm">
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
