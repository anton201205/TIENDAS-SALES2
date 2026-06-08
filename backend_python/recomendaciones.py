def recomendar(juegos,genero):

    resultado=[]

    for juego in juegos:

        if juego["genero"].lower()==genero.lower():
            resultado.append(juego)

    return resultado