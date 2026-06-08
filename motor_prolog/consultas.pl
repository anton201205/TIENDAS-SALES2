:- consult(videojuegos).


es_shooter(X)       :- videojuego(X, shooter).
es_rpg(X)           :- videojuego(X, rpg).
es_sandbox(X)       :- videojuego(X, sandbox).
es_aventura(X)      :- videojuego(X, aventura).
es_accion(X)        :- videojuego(X, accion).
es_deportes(X)      :- videojuego(X, deportes).
es_metroidvania(X)  :- videojuego(X, metroidvania).

% Género de un juego dado
genero_de(Juego, Genero) :- videojuego(Juego, Genero).

% Todos los géneros únicos registrados
genero_existente(G) :- videojuego(_, G).


es_pc(X)          :- plataforma(X, pc).
es_playstation(X) :- plataforma(X, playstation).
es_xbox(X)        :- plataforma(X, xbox).
es_nintendo(X)    :- plataforma(X, nintendo).
es_mobile(X)      :- plataforma(X, mobile).

% Plataforma de un juego dado
plataforma_de(Juego, Plat) :- plataforma(Juego, Plat).

% Juegos disponibles en mas de una plataforma
multiplataforma(X) :-
    plataforma(X, P1),
    plataforma(X, P2),
    P1 \= P2.


juego_rockstar(X)      :- desarrolladora(X, rockstar_games).
juego_cdprojekt(X)     :- desarrolladora(X, cd_projekt_red).
juego_fromsoftware(X)  :- desarrolladora(X, fromsoftware).
juego_valve(X)         :- desarrolladora(X, valve).
juego_riot(X)          :- desarrolladora(X, riot_games).
juego_mojang(X)        :- desarrolladora(X, mojang).
juego_ea(X)            :- desarrolladora(X, ea_sports).
juego_teamcherry(X)    :- desarrolladora(X, team_cherry).
juego_relogic(X)       :- desarrolladora(X, re_logic).
juego_santamonica(X)   :- desarrolladora(X, santa_monica_studio).

% Desarrolladora de un juego dado
desarrolladora_de(Juego, Dev) :- desarrolladora(Juego, Dev).

% Todas las desarrolladoras únicas registradas
empresa(X) :- desarrolladora(_, X).

% Juegos que comparten desarrolladora
misma_desarrolladora(X, Y) :-
    desarrolladora(X, D),
    desarrolladora(Y, D),
    X \= Y.


juego_multijugador(X)    :- multijugador(X).
juego_competitivo(X)     :- competitivo(X).

recomendado_para_amigos(X)   :- multijugador(X).
recomendado_para_competir(X) :- competitivo(X).

% Multijugador competitivo (cumple ambas condiciones)
multijugador_competitivo(X) :-
    multijugador(X),
    competitivo(X).


% Juegos RPG para PC
rpg_en_pc(X) :-
    es_rpg(X),
    es_pc(X).

% Juegos shooter para PC
shooter_en_pc(X) :-
    es_shooter(X),
    es_pc(X).

% Juegos de acción para PC
accion_en_pc(X) :-
    es_accion(X),
    es_pc(X).

% Juegos de Rockstar para PC
rockstar_en_pc(X) :-
    juego_rockstar(X),
    es_pc(X).

% Juegos de CD Projekt Red para PC
cdprojekt_en_pc(X) :-
    juego_cdprojekt(X),
    es_pc(X).

% Juegos exclusivos de PlayStation
exclusivo_playstation(X) :-
    es_playstation(X),
    \+ es_pc(X),
    \+ es_xbox(X),
    \+ es_nintendo(X).

% Juegos exclusivos de PC
exclusivo_pc(X) :-
    es_pc(X),
    \+ es_playstation(X),
    \+ es_xbox(X),
    \+ es_nintendo(X).

% Un juego X es similar a Y si comparten género
juegos_similares(X, Y) :-
    videojuego(X, G),
    videojuego(Y, G),
    X \= Y.


% Juegos de un género dado como parámetro
juegos_de_genero(Genero, X) :- videojuego(X, Genero).

% Juegos de una plataforma dada como parámetro
juegos_de_plataforma(Plat, X) :- plataforma(X, Plat).

% Juegos de una desarrolladora dada como parámetro
juegos_de_desarrolladora(Dev, X) :- desarrolladora(X, Dev).