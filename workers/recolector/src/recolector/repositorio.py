from __future__ import annotations

import os
import sqlite3
import sys
from dataclasses import dataclass
from pathlib import Path

from .normalizadores import OfertaNormalizada

REPO_ROOT = Path(__file__).resolve().parents[4]

FUENTE_REMOTIVE = "Remotive"
FUENTE_REMOTIVE_TIPO = "api"
FUENTE_REMOTIVE_URL = "https://remotive.com/api/remote-jobs"

# Criterio de deduplicación (Fase 2.3): misma oferta = misma `url_oferta` para la misma `fuente_id`.
# Se aplica en el lote actual y frente a filas ya guardadas en SQLite.


def resolve_database_path() -> Path:
    """
    Misma intención que `apps/api` (DATABASE_URL con prefijo sqlite://, ruta relativa a la raíz del repo).
    Sin variable, usa `database/empleanet.db` en la raíz del monorepo.
    """
    default = REPO_ROOT / "database" / "empleanet.db"
    url = (os.environ.get("DATABASE_URL") or "").strip()
    if not url.startswith("sqlite://"):
        return default
    rest = url.removeprefix("sqlite://")
    if not rest:
        return default
    if sys.platform == "win32" and len(rest) >= 3 and rest[0] == "/" and rest[2] == ":" and rest[3] == "/":
        return Path(rest[1:]).resolve()
    p = Path(rest)
    if p.is_absolute():
        return p
    if rest.startswith("/"):
        return Path(rest)
    return (REPO_ROOT / rest).resolve()


def ensure_database_schema(conn: sqlite3.Connection) -> None:
    """Crea tablas base si la API aún no inicializó la base (schema.sql en repo)."""
    row = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='empleo'",
    ).fetchone()
    if row:
        return
    schema_path = REPO_ROOT / "database" / "schema.sql"
    if not schema_path.is_file():
        raise FileNotFoundError(f"No se encontró el esquema: {schema_path}")
    conn.executescript(schema_path.read_text(encoding="utf-8"))


def ensure_empleo_modalidad_column(conn: sqlite3.Connection) -> None:
    """Alineado con apps/api: bases antiguas sin `modalidad` en `empleo`."""
    cur = conn.execute("PRAGMA table_info(empleo)")
    cols = {row[1] for row in cur}
    if "modalidad" not in cols:
        conn.execute("ALTER TABLE empleo ADD COLUMN modalidad TEXT")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_empleo_modalidad ON empleo(modalidad)")


def asegurar_fuente_remotive(conn: sqlite3.Connection) -> int:
    row = conn.execute(
        "SELECT id FROM fuente_empleo WHERE nombre = ? LIMIT 1",
        (FUENTE_REMOTIVE,),
    ).fetchone()
    if row:
        return int(row[0])
    conn.execute(
        "INSERT INTO fuente_empleo (nombre, tipo, url, activa) VALUES (?, ?, ?, 1)",
        (FUENTE_REMOTIVE, FUENTE_REMOTIVE_TIPO, FUENTE_REMOTIVE_URL),
    )
    return int(conn.execute("SELECT last_insert_rowid()").fetchone()[0])  # type: ignore[index]


def urls_existentes(conn: sqlite3.Connection, fuente_id: int) -> set[str]:
    cur = conn.execute(
        "SELECT url_oferta FROM empleo WHERE fuente_id = ? AND url_oferta IS NOT NULL",
        (fuente_id,),
    )
    return {str(r[0]) for r in cur if r[0]}


def insertar_empleo(conn: sqlite3.Connection, fuente_id: int, o: OfertaNormalizada) -> None:
    conn.execute(
        """
        INSERT INTO empleo (
            fuente_id, titulo, empresa, ubicacion, modalidad, descripcion,
            url_oferta, salario, fecha_publicacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            fuente_id,
            o["titulo"],
            o["empresa"],
            o["ubicacion"] or None,
            o["modalidad"] or None,
            o["descripcion"] or None,
            o["url_oferta"],
            o["salario"] or None,
            o["fecha_publicacion"],
        ),
    )


@dataclass
class ResultadoIngesta:
    obtenidos: int
    normalizados: int
    insertados: int
    omitidos_duplicado: int

    @property
    def invalidas_mal_forma(self) -> int:
        """Ofertas en la API que no alcanzaron a normalizarse (id/URL/título mínimo)."""
        return max(0, self.obtenidos - self.normalizados)


def guardar_ofertas(
    ofertas: list[OfertaNormalizada],
    obtenidos_api: int,
) -> ResultadoIngesta:
    """
    Deduplicación: primero por URL dentro del lote; luego omite filas cuya URL ya exista
    para esta fuente en la base.
    """
    path = resolve_database_path()
    path.parent.mkdir(parents=True, exist_ok=True)

    omitidos = 0
    por_url: dict[str, OfertaNormalizada] = {}
    for o in ofertas:
        u = o["url_oferta"]
        if u in por_url:
            omitidos += 1
            continue
        por_url[u] = o
    unicas_lote = list(por_url.values())

    conn = sqlite3.connect(str(path))
    try:
        conn.execute("PRAGMA foreign_keys = ON")
        ensure_database_schema(conn)
        ensure_empleo_modalidad_column(conn)
        fuente_id = asegurar_fuente_remotive(conn)
        existentes = urls_existentes(conn, fuente_id)
        insertados = 0
        for o in unicas_lote:
            u = o["url_oferta"]
            if u in existentes:
                omitidos += 1
                continue
            insertar_empleo(conn, fuente_id, o)
            existentes.add(u)
            insertados += 1
        conn.commit()
    finally:
        conn.close()

    return ResultadoIngesta(
        obtenidos=obtenidos_api,
        normalizados=len(ofertas),
        insertados=insertados,
        omitidos_duplicado=omitidos,
    )
