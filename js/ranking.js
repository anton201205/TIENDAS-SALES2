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
<div class="col-md-6 col-xl-4">

    <div class="ranking-card h-100">

        <div class="ranking-position">
            #${index + 1}
        </div>

        <div class="ranking-content">

            <h3 class="mb-3">
                ${juego.nombre}
            </h3>

            <p class="mb-2">
                Precio: <strong>S/. ${juego.precio.toFixed(2)}</strong>
            </p>

            <div class="score-box">
                ⭐ ${juego.puntuacion}
            </div>

        </div>

    </div>

</div>
`;

        });

    } catch (error) {

        document.getElementById("rankingContainer").innerHTML = `

            <div class="alert alert-danger">
                Error al cargar ranking.
            </div>

        `;

    }

}

window.onload = cargarRanking;