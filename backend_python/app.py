from flask import Flask, jsonify, request
from flask_cors import CORS
from videojuegos import obtener_videojuegos
import subprocess
import os
import json
import re

app = Flask(__name__)
CORS(app)

from autopinger import iniciar_autopinger
iniciar_autopinger()


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

RUTA_PL_CHAT = os.path.join(BASE_DIR, "..", "motor_prolog", "chatbot_bridge.pl")

GENEROS = {"rpg": "rpg", "shooter": "shooter", "disparos": "shooter",
           "sandbox": "sandbox", "accion": "accion", "acción": "accion",
           "aventura": "aventura", "deportes": "deportes", "metroidvania": "metroidvania"}

PLATAFORMAS = {"pc": "pc", "computadora": "pc",
               "playstation": "playstation", "ps4": "playstation", "ps5": "playstation"}

DEVS = {"mojang": "mojang", "riot": "riot_games", "ea sports": "ea_sports",
        "rockstar": "rockstar_games", "cd projekt": "cd_projekt_red",
        "fromsoftware": "fromsoftware", "valve": "valve",
        "santa monica": "santa_monica_studio", "team cherry": "team_cherry",
        "re-logic": "re_logic", "re logic": "re_logic"}

JUEGOS_ALIAS = {
    "minecraft": "minecraft", "valorant": "valorant",
    "fifa 25": "fifa25", "fifa25": "fifa25", "fifa": "fifa25",
    "grand theft auto v": "gta5", "grand theft auto": "gta5",
    "gta v": "gta5", "gta5": "gta5", "gta 5": "gta5", "gta": "gta5",
    "the witcher 3": "the_witcher_3", "witcher 3": "the_witcher_3", "witcher": "the_witcher_3",
    "cyberpunk 2077": "cyberpunk_2077", "cyberpunk": "cyberpunk_2077",
    "elden ring": "elden_ring", "elden": "elden_ring",
    "counter strike 2": "counter_strike_2", "counter strike": "counter_strike_2",
    "cs2": "counter_strike_2", "cs 2": "counter_strike_2",
    "red dead redemption 2": "red_dead_redemption_2", "red dead redemption": "red_dead_redemption_2",
    "red dead": "red_dead_redemption_2", "rdr2": "red_dead_redemption_2",
    "god of war ragnarok": "god_of_war_ragnarok", "god of war": "god_of_war_ragnarok", "gow": "god_of_war_ragnarok",
    "hollow knight": "hollow_knight", "terraria": "terraria"
}

def detectar_filtro(msg, diccionario):
    for clave in diccionario:
        if clave in msg:
            return diccionario[clave]
    return "ninguno"

def detectar_juego(msg):
    for clave in sorted(JUEGOS_ALIAS.keys(), key=len, reverse=True):
        if clave in msg:
            return JUEGOS_ALIAS[clave]
    return None

def detectar_precio_max(msg):
    patrones = [
        r"(?:menos de|menor(?:es)?\s*a|inferior(?:es)?\s*a|hasta|no\s*m[aá]s\s*de|m[aá]ximo(?:\s*de)?|por debajo de|debajo de)\s*(\d+(?:[.,]\d+)?)",
        r"(?:presupuesto(?:\s*de)?|tengo|con)\s*(?:s/\.?\s*)?(\d+(?:[.,]\d+)?)\s*(?:soles?|s/\.?)?",
        r"s/\.?\s*(\d+(?:[.,]\d+)?)",
        r"(\d+(?:[.,]\d+)?)\s*soles?\b"
    ]
    for p in patrones:
        m = re.search(p, msg)
        if m:
            return float(m.group(1).replace(",", "."))
    return None

def ejecutar_prolog_chat(goal):
    resultado = subprocess.run(
        ["swipl", "-q", "-f", RUTA_PL_CHAT, "-g", goal, "-t", "halt"],
        capture_output=True, text=True
    )
    return [l.strip() for l in resultado.stdout.splitlines() if l.strip()]

@app.route("/chat", methods=["POST"])
def chat():
    mensaje = (request.json.get("mensaje") or "").lower()

    if re.match(r"^(hola|buenas|hey)\b", mensaje):
        return jsonify({"tipo": "texto", "mensaje": "¡Hola! Puedes pedirme juegos por género, plataforma, desarrolladora, precio, o algo parecido a un juego."})

    juego = detectar_juego(mensaje)
    catalogo = obtener_videojuegos()

    if ("parecido" in mensaje or "similar" in mensaje) and juego:
        slugs = ejecutar_prolog_chat(f"parecidos({juego})")
        juegos = [j for j in catalogo if j["slug"] in slugs]
        original = next((j for j in catalogo if j["slug"] == juego), None)
        nombre = original["nombre"] if original else juego
        if not juegos:
            return jsonify({"tipo": "texto", "mensaje": "No encontré juegos parecidos a ese en el catálogo."})
        return jsonify({"tipo": "cards", "titulo": f"Juegos parecidos a {nombre}:", "juegos": juegos})

    if ("desarrolladora de" in mensaje or "desarrollador de" in mensaje or re.search(r"qui[eé]n (desarroll|hizo|cre[oó])", mensaje)) and juego:
        resultado = ejecutar_prolog_chat(f"desarrollador_de({juego})")
        j = next((j for j in catalogo if j["slug"] == juego), None)
        if not resultado or not j:
            return jsonify({"tipo": "texto", "mensaje": "No tengo registrada la desarrolladora de ese juego."})
        return jsonify({"tipo": "texto", "mensaje": f"{j['nombre']} fue desarrollado por {j['desarrolladora']}."})

    precio_max = detectar_precio_max(mensaje)
    genero = detectar_filtro(mensaje, GENEROS)
    plataforma = detectar_filtro(mensaje, PLATAFORMAS)
    dev = detectar_filtro(mensaje, DEVS)

    if precio_max is not None:
        hay_otro = genero != "ninguno" or plataforma != "ninguno" or dev != "ninguno"
        if hay_otro:
            slugs = ejecutar_prolog_chat(f"buscar({genero}, {plataforma}, {dev})")
            juegos = [j for j in catalogo if j["slug"] in slugs and j["precio"] <= precio_max]
        else:
            juegos = [j for j in catalogo if j["precio"] <= precio_max]
        if not juegos:
            return jsonify({"tipo": "texto", "mensaje": f"No encontré juegos por debajo de S/ {precio_max}."})
        return jsonify({"tipo": "cards", "titulo": f"Juegos por debajo de S/ {precio_max}:", "juegos": juegos})

    if genero == "ninguno" and plataforma == "ninguno" and dev == "ninguno":
        return jsonify({"tipo": "texto", "mensaje": "No entendí bien qué buscas. Intenta con 'juegos de rpg', 'juegos para pc', 'menores a 100 soles', 'algo parecido a minecraft' o 'desarrolladora de elden ring'."})

    slugs = ejecutar_prolog_chat(f"buscar({genero}, {plataforma}, {dev})")
    juegos = [j for j in catalogo if j["slug"] in slugs]
    if not juegos:
        return jsonify({"tipo": "texto", "mensaje": "No encontré juegos que coincidan con esa búsqueda."})
    return jsonify({"tipo": "cards", "titulo": "Encontré estos juegos para ti:", "juegos": juegos})


def obtener_videojuegos():
    ruta = os.path.join(BASE_DIR, "..", "datos", "videojuegos.json")
    with open(ruta, "r", encoding="utf-8") as archivo:
        return json.load(archivo)

SCALA_EXE     = "scala"  # en Linux, ya en el PATH
SCALA_PROJECT = os.path.join(BASE_DIR, "..", "motor_scala")

def consultar_prolog(goal):
    ruta_pl = os.path.join(BASE_DIR, "..", "motor_prolog", "consultas.pl")
    resultado = subprocess.run(
        ["swipl", "-s", ruta_pl, "-g", goal, "-t", "halt"],
        capture_output=True, text=True
    )
    return resultado.stdout.splitlines()


# ============================================================
#  HELPERS
# ============================================================

def obtener_classpath_scala():
    with open("/opt/scala-cp.txt", "r") as f:
        return f.read().strip()

def ejecutar_scala(objeto, args=[]):
    scala_lib_cp = obtener_classpath_scala()
    classpath = f"{SCALA_PROJECT}:{scala_lib_cp}"

    cmd = ["java", "-cp", classpath, objeto] + [str(a) for a in args]

    return subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=SCALA_PROJECT,
        shell=False
    )


# ============================================================
#  RUTAS GENERALES
# ============================================================

@app.route("/")
def inicio():
    return jsonify({"mensaje": "API funcionando"})


@app.route("/juegos")
def juegos():
    return jsonify(obtener_videojuegos())


@app.route("/test")
def test():
    try:
        resultado = subprocess.run(
            ["which", "scala"],  # "where" es de Windows
            capture_output=True,
            text=True
        )
        return jsonify({
            "stdout": resultado.stdout,
            "stderr": resultado.stderr,
            "returncode": resultado.returncode,
            "motor_scala_existe": os.path.exists(SCALA_PROJECT)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
#  RUTAS SCALA
# ============================================================

@app.route("/ranking")
def ranking():
    try:
        letra            = request.args.get("letra",      "")
        puntuacion_param = request.args.get("puntuacion", "0") or "0"
        precio_param     = request.args.get("precio",     "")  or ""

        resultado = ejecutar_scala("Ranking", [letra, puntuacion_param, precio_param])

        print("=== STDOUT ===", resultado.stdout)
        print("=== STDERR ===", resultado.stderr)
        print("=== CODE ===",   resultado.returncode)

        if resultado.returncode != 0:
            return jsonify({
                "success": False,
                "error":   "Error ejecutando Ranking.scala",
                "stderr":  resultado.stderr,
                "stdout":  resultado.stdout
            }), 500

        juegos = []

        for linea in resultado.stdout.strip().split("\n"):
            linea = linea.strip()
            if not linea:
                continue
            try:
                partes = linea.split(",")
                if len(partes) != 3:
                    print("Línea inválida:", linea)
                    continue
                juegos.append({
                    "nombre":     partes[0].strip(),
                    "puntuacion": float(partes[1].strip()),
                    "precio":     float(partes[2].strip())
                })
            except Exception as e:
                print("Error parseando línea:", linea, "->", str(e))

        return jsonify({
            "success":  True,
            "cantidad": len(juegos),
            "data":     juegos
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/estadisticas")
def estadisticas():
    try:
        resultado = ejecutar_scala("Estadisticas")

        print("=== STDOUT ===", resultado.stdout)
        print("=== STDERR ===", resultado.stderr)
        print("=== CODE ===",   resultado.returncode)

        if resultado.returncode != 0:
            return jsonify({
                "success": False,
                "error":   "Error ejecutando Estadisticas.scala",
                "stderr":  resultado.stderr
            }), 500

        stats = {}
        for linea in resultado.stdout.strip().split("\n"):
            if not linea:
                continue
            try:
                clave, valor = linea.split(",")
                stats[clave.strip().lower()] = float(valor)
            except:
                pass

        return jsonify({"success": True, "data": stats})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
#  RUTAS PROLOG — GÉNEROS
# ============================================================

@app.route("/prolog/shooter")
def prolog_shooter():
    return jsonify(consultar_prolog("es_shooter(X),write(X),nl,fail"))

@app.route("/prolog/rpg")
def prolog_rpg():
    return jsonify(consultar_prolog("es_rpg(X),write(X),nl,fail"))

@app.route("/prolog/sandbox")
def prolog_sandbox():
    return jsonify(consultar_prolog("es_sandbox(X),write(X),nl,fail"))

@app.route("/prolog/aventura")
def prolog_aventura():
    return jsonify(consultar_prolog("es_aventura(X),write(X),nl,fail"))

@app.route("/prolog/accion")
def prolog_accion():
    return jsonify(consultar_prolog("es_accion(X),write(X),nl,fail"))

@app.route("/prolog/deportes")
def prolog_deportes():
    return jsonify(consultar_prolog("es_deportes(X),write(X),nl,fail"))

@app.route("/prolog/metroidvania")
def prolog_metroidvania():
    return jsonify(consultar_prolog("es_metroidvania(X),write(X),nl,fail"))

@app.route("/prolog/genero")
def prolog_genero():
    genero = request.args.get("tipo", "").lower().strip()
    if not genero:
        return jsonify({"error": "Falta el parámetro ?tipo="}), 400
    return jsonify(consultar_prolog(f"juegos_de_genero({genero},X),write(X),nl,fail"))


# ============================================================
#  RUTAS PROLOG — PLATAFORMAS
# ============================================================

@app.route("/prolog/pc")
def prolog_pc():
    return jsonify(consultar_prolog("es_pc(X),write(X),nl,fail"))

@app.route("/prolog/playstation")
def prolog_playstation():
    return jsonify(consultar_prolog("es_playstation(X),write(X),nl,fail"))

@app.route("/prolog/multiplataforma")
def prolog_multiplataforma():
    return jsonify(consultar_prolog("multiplataforma(X),write(X),nl,fail"))

@app.route("/prolog/exclusivo-pc")
def prolog_exclusivo_pc():
    return jsonify(consultar_prolog("exclusivo_pc(X),write(X),nl,fail"))

@app.route("/prolog/exclusivo-playstation")
def prolog_exclusivo_ps():
    return jsonify(consultar_prolog("exclusivo_playstation(X),write(X),nl,fail"))

@app.route("/prolog/plataforma")
def prolog_plataforma():
    plat = request.args.get("tipo", "").lower().strip()
    if not plat:
        return jsonify({"error": "Falta el parámetro ?tipo="}), 400
    return jsonify(consultar_prolog(f"juegos_de_plataforma({plat},X),write(X),nl,fail"))


# ============================================================
#  RUTAS PROLOG — DESARROLLADORAS
# ============================================================

@app.route("/prolog/desarrolladoras")
def prolog_desarrolladoras():
    return jsonify(consultar_prolog("empresa(X),write(X),nl,fail"))

@app.route("/prolog/rockstar")
def prolog_rockstar():
    return jsonify(consultar_prolog("juego_rockstar(X),write(X),nl,fail"))

@app.route("/prolog/cdprojekt")
def prolog_cdprojekt():
    return jsonify(consultar_prolog("juego_cdprojekt(X),write(X),nl,fail"))

@app.route("/prolog/fromsoftware")
def prolog_fromsoftware():
    return jsonify(consultar_prolog("juego_fromsoftware(X),write(X),nl,fail"))

@app.route("/prolog/valve")
def prolog_valve():
    return jsonify(consultar_prolog("juego_valve(X),write(X),nl,fail"))

@app.route("/prolog/riot")
def prolog_riot():
    return jsonify(consultar_prolog("juego_riot(X),write(X),nl,fail"))

@app.route("/prolog/desarrolladora")
def prolog_desarrolladora():
    dev = request.args.get("nombre", "").lower().strip()
    if not dev:
        return jsonify({"error": "Falta el parámetro ?nombre="}), 400
    return jsonify(consultar_prolog(f"juegos_de_desarrolladora({dev},X),write(X),nl,fail"))


# ============================================================
#  RUTAS PROLOG — MULTIJUGADOR Y COMPETITIVO
# ============================================================

@app.route("/prolog/amigos")
def prolog_amigos():
    return jsonify(consultar_prolog("recomendado_para_amigos(X),write(X),nl,fail"))

@app.route("/prolog/competitivo")
def prolog_competitivo():
    return jsonify(consultar_prolog("recomendado_para_competir(X),write(X),nl,fail"))

@app.route("/prolog/multijugador-competitivo")
def prolog_multi_competitivo():
    return jsonify(consultar_prolog("multijugador_competitivo(X),write(X),nl,fail"))


# ============================================================
#  RUTAS PROLOG — CONSULTAS COMBINADAS
# ============================================================

@app.route("/prolog/rpg-pc")
def prolog_rpg_pc():
    return jsonify(consultar_prolog("rpg_en_pc(X),write(X),nl,fail"))

@app.route("/prolog/shooter-pc")
def prolog_shooter_pc():
    return jsonify(consultar_prolog("shooter_en_pc(X),write(X),nl,fail"))

@app.route("/prolog/accion-pc")
def prolog_accion_pc():
    return jsonify(consultar_prolog("accion_en_pc(X),write(X),nl,fail"))

@app.route("/prolog/rockstar-pc")
def prolog_rockstar_pc():
    return jsonify(consultar_prolog("rockstar_en_pc(X),write(X),nl,fail"))

@app.route("/prolog/similares")
def prolog_similares():
    juego = request.args.get("juego", "").lower().strip()
    if not juego:
        return jsonify({"error": "Falta el parámetro ?juego="}), 400
    return jsonify(consultar_prolog(f"juegos_similares({juego},Y),write(Y),nl,fail"))


# ============================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
