from flask import Flask, jsonify, request
from flask_cors import CORS
from videojuegos import obtener_videojuegos
import subprocess
import os

app = Flask(__name__)
CORS(app)

# Ruta absoluta a Scala
SCALA_EXE = r"C:\Program Files (x86)\scala\bin\scala.bat"

# Ruta absoluta a la carpeta donde está Ranking.scala y Ranking.class
SCALA_PROJECT = r"C:\Users\USER\Desktop\TIENDAS SALES\motor_scala"


def ejecutar_scala(objeto, args=[]):
    cmd = [
        SCALA_EXE,
        "-classpath", SCALA_PROJECT,
        objeto
    ] + [str(a) for a in args]

    return subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=SCALA_PROJECT,
        shell=False
    )


@app.route("/")
def inicio():
    return jsonify({
        "mensaje": "API funcionando"
    })


@app.route("/juegos")
def juegos():
    return jsonify(
        obtener_videojuegos()
    )

@app.route("/prolog/amigos")
def prolog_amigos():

    resultado = subprocess.run(
        [
            "swipl",
            "-s",
            "../motor_prolog/consultas.pl",
            "-g",
            "recomendado_para_amigos(X),write(X),nl,fail",
            "-t",
            "halt"
        ],
        capture_output=True,
        text=True
    )

    juegos = resultado.stdout.splitlines()

    return jsonify(juegos)

@app.route("/test")
def test():
    """
    Verifica si Python puede encontrar Scala
    """
    try:
        resultado = subprocess.run(
            ["where", "scala"],
            capture_output=True,
            text=True,
            shell=True
        )

        return jsonify({
            "stdout": resultado.stdout,
            "stderr": resultado.stderr,
            "returncode": resultado.returncode,
            "scala_existe": os.path.exists(SCALA_EXE),
            "motor_scala_existe": os.path.exists(SCALA_PROJECT)
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route("/ranking")
def ranking():

    try:

        letra = request.args.get("letra", "")

        puntuacion_param = request.args.get("puntuacion", "0") or "0"

        precio_param = request.args.get("precio", "") or ""

        resultado = ejecutar_scala(
            "Ranking",
            [letra, puntuacion_param, precio_param]
        )

        print("=== STDOUT ===", resultado.stdout)
        print("=== STDERR ===", resultado.stderr)
        print("=== CODE ===",   resultado.returncode)

        if resultado.returncode != 0:
            return jsonify({
                "success": False,
                "error": "Error ejecutando Ranking.scala",
                "stderr": resultado.stderr,
                "stdout": resultado.stdout
            }), 500

        juegos = []

        lineas = resultado.stdout.strip().split("\n")

        for linea in lineas:

            linea = linea.strip()

            if not linea:
                continue

            try:
                partes = linea.split(",")

                if len(partes) != 3:
                    print("Línea inválida:", linea)
                    continue

                nombre = partes[0].strip()

                puntaje_juego = float(partes[1].strip())
                precio_juego  = float(partes[2].strip())

                juegos.append({
                    "nombre":    nombre,
                    "puntuacion": puntaje_juego,
                    "precio":    precio_juego
                })

            except Exception as e:
                print("Error parseando línea:", linea, "->", str(e))

        return jsonify({
            "success": True,
            "cantidad": len(juegos),
            "data": juegos
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


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
                "error": "Error ejecutando Estadisticas.scala",
                "stderr": resultado.stderr
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

        return jsonify({
            "success": True,
            "data": stats
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/prolog/desarrolladoras")
def prolog_desarrolladoras():

    resultado = subprocess.run(
        [
            "swipl",
            "-s",
            "../motor_prolog/consultas.pl",
            "-g",
            "empresa(X),write(X),nl,fail",
            "-t",
            "halt"
        ],
        capture_output=True,
        text=True
    )

    return jsonify(resultado.stdout.splitlines())

@app.route("/prolog/pc")
def prolog_pc():

    resultado = subprocess.run(
        [
            "swipl",
            "-s",
            "../motor_prolog/consultas.pl",
            "-g",
            "es_pc(X),write(X),nl,fail",
            "-t",
            "halt"
        ],
        capture_output=True,
        text=True
    )

    return jsonify(resultado.stdout.splitlines())
    
@app.route("/prolog/shooter")
def prolog_shooter():

    resultado = subprocess.run(
        [
            "swipl",
            "-s",
            "../motor_prolog/consultas.pl",
            "-g",
            "es_shooter(X),write(X),nl,fail",
            "-t",
            "halt"
        ],
        capture_output=True,
        text=True
    )

    return jsonify(resultado.stdout.splitlines())

if __name__ == "__main__":
    app.run(debug=True)
