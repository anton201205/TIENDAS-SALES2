:- consult(consultas).

% ===============================
% PUENTE PARA EL CHATBOT
% Reutiliza los hechos videojuego/2, plataforma/2, desarrolladora/2
% que ya vienen cargados desde consultas.pl -> videojuegos.pl
% ===============================

coincide_genero(ninguno, _) :- !.
coincide_genero(G, X) :- videojuego(X, G).

coincide_plataforma(ninguno, _) :- !.
coincide_plataforma(P, X) :- plataforma(X, P).

coincide_dev(ninguno, _) :- !.
coincide_dev(D, X) :- desarrolladora(X, D).

buscar(Genero, Plataforma, Dev) :-
    findall(X, (
        videojuego(X, _),
        coincide_genero(Genero, X),
        coincide_plataforma(Plataforma, X),
        coincide_dev(Dev, X)
    ), Lista),
    forall(member(X, Lista), (write(X), nl)).

% ===============================
% JUEGOS PARECIDOS (mismo genero, excluyendo el propio)
% ===============================
parecidos(Juego) :-
    ( videojuego(Juego, _)
    -> findall(Y, juegos_similares(Juego, Y), L0),
       list_to_set(L0, Lista),
       forall(member(Y, Lista), (write(Y), nl))
    ;  true
    ).

% ===============================
% DESARROLLADORA DE UN JUEGO ESPECIFICO
% ===============================
desarrollador_de(Juego) :-
    ( desarrolladora(Juego, Dev)
    -> (write(Dev), nl)
    ;  true
    ).