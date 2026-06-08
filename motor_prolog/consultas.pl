:- consult(videojuegos).

es_shooter(X):-
    videojuego(X,shooter).

es_pc(X):-
    plataforma(X,pc).

juego_multijugador(X):-
    multijugador(X).

juego_competitivo(X):-
    competitivo(X).

recomendado_para_amigos(X):-
    multijugador(X).

recomendado_para_competir(X):-
    competitivo(X).

juego_de_riot(X):-
    desarrolladora(X,riot).

es_rpg(X):-
    videojuego(X,rpg).

es_playstation(X):-
    plataforma(X,playstation).

juego_rockstar(X):-
    desarrolladora(X,rockstar_games).

juego_cdprojekt(X):-
    desarrolladora(X,cd_projekt_red).

empresa(X):-
    desarrolladora(_,X).