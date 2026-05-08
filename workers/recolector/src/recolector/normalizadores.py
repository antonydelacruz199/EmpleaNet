from __future__ import annotations

import html
import re
from typing import Any, TypedDict

_RE_HTML_TAGS = re.compile(r"<[^>]+>")


def _texto_plano(s: str | None) -> str:
    """Convierte texto de oferta a plano, sin marcas HTML, sin reventar almacenamiento con HTML bruto."""
    if not s or not str(s).strip():
        return ""
    t = html.unescape(str(s))
    t = _RE_HTML_TAGS.sub(" ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def _str_seguro(s: object | None) -> str:
    if s is None:
        return ""
    return str(s).strip()


class OfertaNormalizada(TypedDict):
    remotive_id: int
    titulo: str
    empresa: str
    ubicacion: str
    modalidad: str
    descripcion: str
    url_oferta: str
    salario: str
    fecha_publicacion: str | None


def normalizar_oferta_remotive(job: dict[str, Any]) -> OfertaNormalizada | None:
    """
    Mapea un objeto 'job' de la API de Remotive a filas alineadas con la tabla `empleo`.
    Devuelve None si faltan campos mínimos.
    """
    try:
        rid = int(job["id"])
    except (TypeError, ValueError, KeyError):
        return None
    url = _str_seguro(job.get("url"))
    titulo = _str_seguro(job.get("title"))
    if not url or not titulo:
        return None

    empresa = _str_seguro(job.get("company_name")) or "Sin empresa"
    ubic = _str_seguro(job.get("candidate_required_location")) or "Remoto / no especificado"
    salario = _str_seguro(job.get("salary"))
    desc = _texto_plano(job.get("description"))
    pub = _str_seguro(job.get("publication_date")) or None
    # Listado Remotive = trabajo remoto; el modelo EmpleaNet usa remoto / presencial / hibrido.
    modalidad = "remoto"

    return {
        "remotive_id": rid,
        "titulo": titulo,
        "empresa": empresa,
        "ubicacion": ubic,
        "modalidad": modalidad,
        "descripcion": desc,
        "url_oferta": url,
        "salario": salario,
        "fecha_publicacion": pub,
    }


def normalizar_lote(jobs: list[dict[str, Any]]) -> list[OfertaNormalizada]:
    out: list[OfertaNormalizada] = []
    for job in jobs:
        n = normalizar_oferta_remotive(job)
        if n is not None:
            out.append(n)
    return out
