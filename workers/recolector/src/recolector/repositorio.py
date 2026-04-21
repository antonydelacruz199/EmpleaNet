from __future__ import annotations

import logging

from .normalizadores import OfertaNormalizada


def guardar_ofertas(ofertas: list[OfertaNormalizada]) -> int:
    logging.info("Persistiendo %s ofertas (modo demo).", len(ofertas))
    return len(ofertas)
