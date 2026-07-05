const API_URL = "http://localhost:5000";

async function cargarJuegos() {

    const respuesta = await fetch(`${API_URL}/juegos`);

    const juegos = await respuesta.json();

    const contenedor = document.getElementById("lista-juegos");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    juegos.forEach(juego => {

        contenedor.innerHTML += `

        <div class="col-md-6 col-lg-4">

            <div class="catalog-card">

                ${
                    juego.imagen
                    ?
                    `<img src="${juego.imagen}"
                         class="catalog-image"
                         alt="${juego.nombre}">`
                    :
                    `<div class="placeholder-image">
                    </div>`
                }

                <div class="catalog-body">

                    <div class="d-flex justify-content-between mb-3">

                        <span class="badge badge-genero">
                            ${juego.genero}
                        </span>

                        <span class="badge score-badge">
                            ⭐ ${juego.puntaje}
                        </span>

                    </div>

                    <h4 class="game-title">
                        ${juego.nombre}
                    </h4>

                    <p class="game-info">
                        Desarrolladora: ${juego.desarrolladora}
                    </p>

                    <p class="game-info">
                        Plataforma: ${juego.plataforma}
                    </p>

                    <hr style="border-color:#334155;">

                    <div class="d-flex justify-content-between align-items-center">

                        <span class="game-price">

                            ${
                                juego.precio === 0
                                ? "Gratis"
                                : "S/ " + juego.precio.toFixed(2)
                            }

                        </span>


                    </div>

                </div>

            </div>

        </div>

        `;
    });
}

window.onload = cargarJuegos;