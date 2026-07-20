// ===============================
// SERVIDOR CHAT + PROLOG + JSON
// ===============================

const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS: soluciona el error del navegador ---
app.use(cors({
    origin: ["https://tu-frontend.onrender.com"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// --- Rutas a datos y reglas ---
const RUTA_JSON = path.join(__dirname, "..", "datos", "videojuegos.json");
const RUTA_PL = path.join(__dirname, "chatbot_bridge.pl");

function cargarJuegos() {
    const raw = fs.readFileSync(RUTA_JSON, "utf-8");
    return JSON.parse(raw);
}

const GENEROS = {
    "rpg": "rpg", "shooter": "shooter", "disparos": "shooter",
    "sandbox": "sandbox", "accion": "accion", "acción": "accion",
    "aventura": "aventura", "deportes": "deportes", "metroidvania": "metroidvania"
};

const PLATAFORMAS = {
    "pc": "pc", "computadora": "pc",
    "playstation": "playstation", "ps4": "playstation", "ps5": "playstation"
};

const DEVS = {
    "mojang": "mojang", "riot": "riot_games", "ea sports": "ea_sports",
    "rockstar": "rockstar_games", "cd projekt": "cd_projekt_red",
    "fromsoftware": "fromsoftware", "valve": "valve",
    "santa monica": "santa_monica_studio", "team cherry": "team_cherry",
    "re-logic": "re_logic", "re logic": "re_logic"
};

const JUEGOS_ALIAS = {
    "minecraft": "minecraft",
    "valorant": "valorant",
    "fifa 25": "fifa25", "fifa25": "fifa25", "fifa": "fifa25",
    "grand theft auto v": "gta5", "grand theft auto": "gta5",
    "gta v": "gta5", "gta5": "gta5", "gta 5": "gta5", "gta": "gta5",
    "the witcher 3": "the_witcher_3", "witcher 3": "the_witcher_3", "witcher": "the_witcher_3",
    "cyberpunk 2077": "cyberpunk_2077", "cyberpunk": "cyberpunk_2077",
    "elden ring": "elden_ring", "elden": "elden_ring",
    "counter strike 2": "counter_strike_2", "counter strike": "counter_strike_2",
    "cs2": "counter_strike_2", "cs 2": "counter_strike_2",
    "red dead redemption 2": "red_dead_redemption_2", "red dead redemption": "red_dead_redemption_2",
    "red dead": "red_dead_redemption_2", "rdr2": "red_dead_redemption_2",
    "god of war ragnarok": "god_of_war_ragnarok", "god of war": "god_of_war_ragnarok", "gow": "god_of_war_ragnarok",
    "hollow knight": "hollow_knight",
    "terraria": "terraria"
};

function detectarFiltro(mensajeLower, diccionario) {
    for (const clave of Object.keys(diccionario)) {
        if (mensajeLower.includes(clave)) return diccionario[clave];
    }
    return "ninguno";
}

// Detecta un juego mencionado en el mensaje. Prueba alias mas largos primero
// para evitar que un alias corto (ej. "gta") se cuele antes de uno mas especifico.
function detectarJuego(mensajeLower) {
    const alias = Object.keys(JUEGOS_ALIAS).sort((a, b) => b.length - a.length);
    for (const clave of alias) {
        if (mensajeLower.includes(clave)) return JUEGOS_ALIAS[clave];
    }
    return null;
}

// ===============================
// RUTA: LISTAR TODOS LOS JUEGOS
// ===============================
app.get("/juegos", (req, res) => {
    try {
        const juegos = cargarJuegos();
        res.json(juegos);
    } catch (e) {
        console.error("Error cargando juegos:", e);
        res.status(500).json({ error: "No se pudo cargar el catálogo de juegos." });
    }
});

// ===============================
// RUTA: RANKING DE JUEGOS (con filtros)
// ===============================
app.get("/ranking", (req, res) => {
    try {
        const { letra, puntuacion, precio } = req.query;

        let juegos = cargarJuegos();

        // Filtro por letra inicial del nombre (ej. ?letra=g)
        if (letra && letra.trim() !== "") {
            const letraLower = letra.trim().toLowerCase();
            juegos = juegos.filter(j =>
                j.nombre && j.nombre.toLowerCase().startsWith(letraLower)
            );
        }

        // Filtro por puntuación mínima (ej. ?puntuacion=8)
        if (puntuacion && puntuacion.trim() !== "") {
            const puntMin = parseFloat(puntuacion);
            if (!isNaN(puntMin)) {
                juegos = juegos.filter(j => j.puntaje >= puntMin);
            }
        }

        // Filtro por precio máximo (ej. ?precio=100)
        if (precio && precio.trim() !== "") {
            const precioMax = parseFloat(precio);
            if (!isNaN(precioMax)) {
                juegos = juegos.filter(j => j.precio <= precioMax);
            }
        }

        // Orden descendente por puntaje (ranking)
        juegos.sort((a, b) => b.puntaje - a.puntaje);

        // Mapear "puntaje" -> "puntuacion" para que coincida con lo que espera ranking.js
        const data = juegos.map(j => ({
            ...j,
            puntuacion: j.puntaje
        }));

        res.json({ data });

    } catch (e) {
        console.error("Error en /ranking:", e);
        res.status(500).json({ error: "No se pudo generar el ranking." });
    }
});

// Detecta un tope de precio en soles: "menos de 100", "menores a 100 soles", "hasta 50", "maximo 80"
// Detecta un tope de precio en soles en distintas formas de escribirlo:
// "menos de 100", "hasta 50 soles", "máximo 80", "100 soles", "S/100",
// "tengo 100 soles", "presupuesto de 150", "no más de 200"
function detectarPrecioMax(mensajeLower) {
    // 1. Frases explícitas de "tope máximo"
    let match = mensajeLower.match(
        /(?:menos de|menor(?:es)?\s*a|inferior(?:es)?\s*a|hasta|no\s*m[aá]s\s*de|m[aá]ximo(?:\s*de)?|por debajo de|debajo de)\s*(\d+(?:[.,]\d+)?)/
    );
    if (match) return parseFloat(match[1].replace(",", "."));

    match = mensajeLower.match(
        /(?:presupuesto(?:\s*de)?|tengo|con)\s*(?:s\/\.?\s*)?(\d+(?:[.,]\d+)?)\s*(?:soles?|s\/\.?)?/
    );
    if (match) return parseFloat(match[1].replace(",", "."));

    // 3. Formato con símbolo de moneda: "S/100", "S/ 100.50"
    match = mensajeLower.match(/s\/\.?\s*(\d+(?:[.,]\d+)?)/);
    if (match) return parseFloat(match[1].replace(",", "."));

    // 4. Fallback: cualquier número seguido de "soles" o "sol"
    match = mensajeLower.match(/(\d+(?:[.,]\d+)?)\s*soles?\b/);
    if (match) return parseFloat(match[1].replace(",", "."));

    return null;
}

function esIntencionParecido(mensajeLower) {
    return mensajeLower.includes("parecido") || mensajeLower.includes("similar") || mensajeLower.includes("se parezca");
}

function esIntencionDesarrolladora(mensajeLower) {
    return mensajeLower.includes("desarrolladora de") ||
        mensajeLower.includes("desarrollador de") ||
        /qui[eé]n (desarroll|hizo|cre[oó])/.test(mensajeLower);
}

// --- Ejecutar una consulta Prolog generica (goal ya armado) y devolver lineas de stdout ---
function ejecutarProlog(goal) {
    return new Promise((resolve, reject) => {
        execFile("swipl", ["-q", "-f", RUTA_PL, "-g", goal, "-t", "halt"], { cwd: __dirname }, (err, stdout, stderr) => {
            if (err) return reject(stderr || err.message);
            const lineas = stdout.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
            resolve(lineas);
        });
    });
}

function consultarBuscar(genero, plataforma, dev) {
    return ejecutarProlog(`buscar(${genero}, ${plataforma}, ${dev})`);
}

function consultarParecidos(slug) {
    return ejecutarProlog(`parecidos(${slug})`);
}

function consultarDesarrollador(slug) {
    return ejecutarProlog(`desarrollador_de(${slug})`);
}

// ===============================
// RUTA PRINCIPAL DEL CHAT
// ===============================
app.post("/chat", async (req, res) => {
    const mensaje = (req.body.mensaje || "").toLowerCase();

    // Saludo simple sin pasar por Prolog
    if (/^(hola|buenas|hey)\b/.test(mensaje)) {
        return res.json({
            tipo: "texto",
            mensaje: "¡Hola! Puedes pedirme juegos por género, plataforma, desarrolladora, precio, o pedirme algo parecido a un juego. Ej: 'quiero juegos de rpg para pc', 'menores a 100 soles', 'algo parecido a minecraft', 'desarrolladora de elden ring'."
        });
    }

    const juegoMencionado = detectarJuego(mensaje);

    // --- 1. "Algo parecido a X" ---
    if (esIntencionParecido(mensaje) && juegoMencionado) {
        try {
            const slugs = await consultarParecidos(juegoMencionado);
            if (slugs.length === 0) {
                return res.json({ tipo: "texto", mensaje: "No encontré juegos parecidos a ese en el catálogo." });
            }
            const catalogo = cargarJuegos();
            const juegos = catalogo.filter(j => slugs.includes(j.slug));
            const original = catalogo.find(j => j.slug === juegoMencionado);
            const nombreOriginal = original ? original.nombre : juegoMencionado;
            return res.json({
                tipo: "cards",
                titulo: `Juegos parecidos a ${nombreOriginal}:`,
                juegos
            });
        } catch (e) {
            console.error("Error en parecidos:", e);
            return res.json({ tipo: "texto", mensaje: "Hubo un problema buscando juegos parecidos." });
        }
    }

    // --- 2. "Desarrolladora de X" ---
    if (esIntencionDesarrolladora(mensaje) && juegoMencionado) {
        try {
            const resultado = await consultarDesarrollador(juegoMencionado);
            const catalogo = cargarJuegos();
            const juego = catalogo.find(j => j.slug === juegoMencionado);
            if (resultado.length === 0 || !juego) {
                return res.json({ tipo: "texto", mensaje: "No tengo registrada la desarrolladora de ese juego." });
            }
            return res.json({
                tipo: "texto",
                mensaje: `${juego.nombre} fue desarrollado por ${juego.desarrolladora}.`
            });
        } catch (e) {
            console.error("Error en desarrollador_de:", e);
            return res.json({ tipo: "texto", mensaje: "Hubo un problema consultando la desarrolladora." });
        }
    }

    // --- 3. Filtro de precio ("menores a 100 soles"), combinable con genero/plataforma/dev ---
    const precioMax = detectarPrecioMax(mensaje);
    const genero = detectarFiltro(mensaje, GENEROS);
    const plataforma = detectarFiltro(mensaje, PLATAFORMAS);
    const dev = detectarFiltro(mensaje, DEVS);

    if (precioMax !== null) {
        try {
            const catalogo = cargarJuegos();
            let juegos;

            const hayOtroFiltro = genero !== "ninguno" || plataforma !== "ninguno" || dev !== "ninguno";

            if (hayOtroFiltro) {
                const slugs = await consultarBuscar(genero, plataforma, dev);
                juegos = catalogo.filter(j => slugs.includes(j.slug) && j.precio <= precioMax);
            } else {
                juegos = catalogo.filter(j => j.precio <= precioMax);
            }

            if (juegos.length === 0) {
                return res.json({ tipo: "texto", mensaje: `No encontré juegos por debajo de S/ ${precioMax}.` });
            }

            return res.json({
                tipo: "cards",
                titulo: `Juegos por debajo de S/ ${precioMax}:`,
                juegos
            });
        } catch (e) {
            console.error("Error en filtro de precio:", e);
            return res.json({ tipo: "texto", mensaje: "Hubo un problema filtrando por precio." });
        }
    }

    // --- 4. Filtro clasico por genero/plataforma/desarrolladora ---
    if (genero === "ninguno" && plataforma === "ninguno" && dev === "ninguno") {
        return res.json({
            tipo: "texto",
            mensaje: "No entendí bien qué buscas. Intenta con algo como 'juegos de rpg', 'juegos para pc', 'menores a 100 soles', 'algo parecido a minecraft' o 'desarrolladora de elden ring'."
        });
    }

    try {
        const slugs = await consultarBuscar(genero, plataforma, dev);

        if (slugs.length === 0) {
            return res.json({ tipo: "texto", mensaje: "No encontré juegos que coincidan con esa búsqueda." });
        }

        const catalogo = cargarJuegos();
        const juegos = catalogo.filter(j => slugs.includes(j.slug));

        return res.json({
            tipo: "cards",
            titulo: "Encontré estos juegos para ti:",
            juegos
        });

    } catch (errorProlog) {
        console.error("=== ERROR CONSULTANDO PROLOG ===");
        console.error(errorProlog);
        console.error("================================");
        return res.json({ tipo: "texto", mensaje: "Hubo un problema consultando la base de reglas." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});