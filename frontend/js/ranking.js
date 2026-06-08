const API_URL = "http://localhost:5000";

async function cargarRanking() {

    const letra =
        document.getElementById("filtroLetra").value;

    const puntuacion =
        document.getElementById("filtroPuntuacion").value;

    const precio =
        document.getElementById("filtroPrecio").value;

    const url =
        `${API_URL}/ranking?letra=${letra}&puntuacion=${puntuacion}&precio=${precio}`;

    try {

        const response = await fetch(url);

        const resultado = await response.json();

        const contenedor =
            document.getElementById("rankingContainer");

        contenedor.innerHTML = "";

        resultado.data.forEach((juego, index) => {

            contenedor.innerHTML += `

                <div class="col-lg-6">

                    <div class="ranking-card">

                        <div class="ranking-position">
                            #${index + 1}
                        </div>

                        <div class="ranking-content">

                            <h3>${juego.nombre}</h3>

                            <p>
                                Precio: S/. ${juego.precio}
                            </p>

                            <div class="score-box">
                                ⭐ ${juego.puntuacion}
                            </div>

                        </div>

                    </div>

                </div>

            `;

        });

    } catch(error) {

        document.getElementById("rankingContainer").innerHTML = `

            <div class="alert alert-danger">
                Error al cargar ranking.
            </div>

        `;

    }

}

window.onload = cargarRanking;