import json

def obtener_videojuegos():

    with open("../datos/videojuegos.json","r",encoding="utf-8") as archivo:
        return json.load(archivo)