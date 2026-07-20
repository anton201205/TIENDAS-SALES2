"""
autopinger.py
Mantiene despierto el backend en Render haciendo un request periódico
a sí mismo (o a la URL que definas) cada X minutos.

Uso:
    Desde app.py, después de crear la app Flask:

        from autopinger import iniciar_autopinger
        iniciar_autopinger()

Requiere la variable de entorno RENDER_EXTERNAL_URL (Render la define
automáticamente) o puedes pasar la URL manualmente.
"""

import os
import threading
import time
import requests

# Intervalo entre pings (en segundos). Render "duerme" servicios free
# tras ~15 min de inactividad, así que 4-5 min es un margen seguro.
INTERVALO_SEGUNDOS = 4 * 60  # 4 minutos

# Ruta a la que se hace ping. Puede ser "/" o un endpoint de salud tipo "/health"
RUTA_PING = "/"


def _obtener_url_base():
    """
    Render define automáticamente RENDER_EXTERNAL_URL con la URL pública
    del servicio. Si no existe (ej. corriendo local), usamos una por defecto.
    """
    url = os.environ.get("RENDER_EXTERNAL_URL")
    if url:
        return url.rstrip("/")
    return os.environ.get("PING_URL_FALLBACK", "http://localhost:5000").rstrip("/")


def _loop_pinger():
    url_completa = _obtener_url_base() + RUTA_PING
    while True:
        try:
            resp = requests.get(url_completa, timeout=10)
            print(f"[autopinger] Ping OK -> {url_completa} ({resp.status_code})")
        except Exception as e:
            print(f"[autopinger] Error al hacer ping: {e}")
        time.sleep(INTERVALO_SEGUNDOS)


def iniciar_autopinger():
    """
    Lanza el autopinger en un hilo daemon para que no bloquee la app
    ni impida que el proceso termine correctamente.
    """
    hilo = threading.Thread(target=_loop_pinger, daemon=True)
    hilo.start()
    print("[autopinger] Iniciado.")