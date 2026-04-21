from __future__ import annotations

from typing import TypedDict


class OfertaCruda(TypedDict):
    titulo: str
    empresa: str
    ubicacion: str
    etiquetas: list[str]


def extraer_ofertas() -> list[OfertaCruda]:
    return [
        {
            "titulo": "Desarrollador frontend",
            "empresa": "Acme",
            "ubicacion": "Remoto",
            "etiquetas": ["react", "typescript"],
        },
        {
            "titulo": "Ingeniero backend",
            "empresa": "Globex",
            "ubicacion": "Madrid",
            "etiquetas": ["nodejs", "postgresql"],
        },
    ]
