from __future__ import annotations

from typing import TypedDict

from .extractores import OfertaCruda


class OfertaNormalizada(TypedDict):
    id: str
    titulo: str
    empresa: str
    ubicacion: str
    etiquetas: list[str]


def normalizar_ofertas(ofertas: list[OfertaCruda]) -> list[OfertaNormalizada]:
    normalizadas: list[OfertaNormalizada] = []
    for i, oferta in enumerate(ofertas, start=1):
        normalizadas.append(
            {
                "id": str(i),
                "titulo": oferta["titulo"].strip(),
                "empresa": oferta["empresa"].strip(),
                "ubicacion": oferta["ubicacion"].strip(),
                "etiquetas": [tag.strip().lower() for tag in oferta["etiquetas"] if tag.strip()],
            }
        )
    return normalizadas
