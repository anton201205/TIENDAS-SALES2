const BASE = "http://127.0.0.1:5000";

async function fetchProlog(ruta) {
    const res = await fetch(`${BASE}${ruta}`);
    return await res.json();
}

async function consultarPC() {
    const data = await fetchProlog("/prolog/pc");
    renderResultados("Juegos disponibles para PC", data, "PC");
}

async function consultarShooter() {
    const data = await fetchProlog("/prolog/shooter");
    renderResultados("Juegos Shooter", data, "Shooter");
}

async function consultarDesarrolladoras() {
    const data = await fetchProlog("/prolog/desarrolladoras");
    renderResultados("Desarrolladoras registradas", data, "Empresa");
}


async function consultarRPG() {
    const data = await fetchProlog("/prolog/rpg");
    renderResultados("Juegos RPG", data, "RPG");
}

async function consultarRPG_PC() {
    const data = await fetchProlog("/prolog/rpg-pc");
    renderResultados("Juegos RPG disponibles en PC", data, "RPG · PC");
}

async function consultarSimilares() {
    const juego = document.getElementById("inputJuego").value.trim().toLowerCase();

    if (!juego) {
        alert("Escribe el nombre de un juego. Ejemplo: elden_ring");
        return;
    }

    const data = await fetchProlog(`/prolog/similares?juego=${juego}`);
    renderResultados(`Juegos similares a "${juego}"`, data, "Similar");
}

function renderResultados(titulo, items, badgeTexto = "Consulta") {

    const contenedor = document.getElementById("resultadoConsulta");

    if (!items.length) {
        contenedor.innerHTML = `
            <div class="alert alert-warning">
                No se encontraron resultados.
            </div>
        `;
        return;
    }

    contenedor.innerHTML = `
        <div class="mb-4">
            <h3>${titulo}</h3>
        </div>

        <div class="row g-4">
            ${items.map(item => `
                <div class="col-md-6 col-lg-4">
                    <div class="catalog-card">
                        <div class="catalog-body text-center">
                            <span class="badge badge-genero mb-3">
                                ${badgeTexto}
                            </span>
                            <h4 class="game-title mb-0">
                                ${item}
                            </h4>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}