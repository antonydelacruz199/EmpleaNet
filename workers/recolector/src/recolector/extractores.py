from __future__ import annotations

import json
import ssl
import urllib.error
import urllib.request
from typing import Any

# API pública documentada: https://remotive.com/api-documentation
REMOTIVE_REMOTE_JOBS_URL = "https://remotive.com/api/remote-jobs"
USER_AGENT = "EmpleaNet-recolector/0.1 (+https://github.com/empleanet)"


def extraer_ofertas(url: str = REMOTIVE_REMOTE_JOBS_URL, timeout: int = 60) -> list[dict[str, Any]]:
    """
    GET JSON de Remotive y devuelve la lista 'jobs' (vacía si no hay o hay error estructural).
    """
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
    )
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
    except urllib.error.URLError as e:
        raise RuntimeError(f"No se pudo consultar Remotive: {e}") from e
    data = json.loads(raw)
    jobs = data.get("jobs")
    if not isinstance(jobs, list):
        return []
    return [j for j in jobs if isinstance(j, dict)]
