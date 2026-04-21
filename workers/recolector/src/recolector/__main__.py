from __future__ import annotations

import logging
import sys

from .extractores import extraer_ofertas
from .normalizadores import normalizar_ofertas
from .repositorio import guardar_ofertas

def run_once() -> int:
    """Un ciclo de recolección: extraer, normalizar y guardar ofertas."""
    crudas = extraer_ofertas()
    normalizadas = normalizar_ofertas(crudas)
    total = guardar_ofertas(normalizadas)
    logging.info("Ciclo de recolección completado con %s ofertas.", total)
    return 0


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    code = run_once()
    sys.exit(code)


if __name__ == "__main__":
    main()
