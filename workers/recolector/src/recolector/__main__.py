from __future__ import annotations

import sys

from .extractores import extraer_ofertas
from .normalizadores import normalizar_lote
from .repositorio import ResultadoIngesta, resolve_database_path, guardar_ofertas


def run_once() -> int:
    crudas = extraer_ofertas()
    normalizadas = normalizar_lote(crudas)
    resultado: ResultadoIngesta = guardar_ofertas(
        normalizadas,
        obtenidos_api=len(crudas),
    )

    db_path = resolve_database_path()
    print("")
    print("EmpleaNet recolector - Remotive API")
    print(f"  Base de datos:     {db_path}")
    print(f"  Obtenidos (API):   {resultado.obtenidos}")
    print(f"  Normalizados:      {resultado.normalizados}")
    print(f"  Insertados:        {resultado.insertados}")
    print(f"  Omitidos (dup.):   {resultado.omitidos_duplicado}")
    if resultado.obtenidos > resultado.normalizados:
        n_inv = resultado.invalidas_mal_forma
        print(f"  Descartados (faltan id/url/título): {n_inv}")
    print("  Criterio duplicado: misma url_oferta para la fuente Remotive (lote + base).")
    print("")
    return 0


def main() -> None:
    code = run_once()
    sys.exit(code)


if __name__ == "__main__":
    main()
