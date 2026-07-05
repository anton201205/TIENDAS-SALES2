// ===============================
// GAMEBOT CHAT ENGINE (FIXED)
// ===============================

document.addEventListener("DOMContentLoaded", () => {

const body = document.getElementById("gamebot-body");
const input = document.getElementById("mensajeChat");
const btn = document.getElementById("btnEnviar");
const typing = document.getElementById("typing");
const chat = document.getElementById("gamebot");
const abrirChat = document.getElementById("abrirChat");
const minimizar = document.getElementById("minimizarChat");

// ===============================
// ENVIAR MENSAJE
// ===============================

btn.addEventListener("click", enviarMensaje);

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") enviarMensaje();
});

// ===============================
// MINIMIZAR CHAT
// ===============================

minimizar.addEventListener("click", () => {
    chat.classList.add("minimizado");
    abrirChat.classList.add("visible");
});

// ===============================
// ABRIR CHAT
// ===============================

abrirChat.addEventListener("click", () => {
    chat.classList.remove("minimizado");
    abrirChat.classList.remove("visible");
});

// ===============================
// ENVIAR MENSAJE
// ===============================

async function enviarMensaje() {

    const texto = input.value.trim();
    if (!texto) return;

    agregarMensaje(texto, "usuario");
    input.value = "";

    mostrarTyping(true);

    const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ mensaje: texto })
    });

    let data;

    try {
        if (!res.ok) throw new Error('Error en la petición');
        data = await res.json();
    } catch (err) {
        mostrarTyping(false);
        agregarMensaje('Error contactando al servidor.', 'bot');
        return;
    }

    mostrarTyping(false);

    // Manejar distintos tipos de respuesta del backend
    if (data.tipo === 'texto' || data.mensaje) {
        agregarMensaje(data.mensaje || data.texto || 'Respuesta recibida', 'bot');
    }
    else if (data.tipo === 'cards' || data.juegos) {
        const titulo = data.titulo || data.titulo || 'Recomendados';
        renderCards(titulo, data.juegos || data.juegos || data.data || []);
    }
    else if (data.tipo === 'prolog') {
        const resultado = data.resultado || data.data || [];
        const textoResultado = Array.isArray(resultado) ? resultado.join('\n') : String(resultado);
        agregarMensaje(textoResultado || 'No hay resultados', 'bot');
    }
    else if (data.tipo === 'scala') {
        const contenido = data.contenido || data.stdout || '';
        agregarMensaje(contenido || 'Respuesta Scala', 'bot');
    }
    else {
        // Fallback genérico
        agregarMensaje(JSON.stringify(data), 'bot');
    }

    scrollBottom();
}

// ===============================
// MENSAJES
// ===============================

function agregarMensaje(texto, tipo) {

    const div = document.createElement("div");
    div.classList.add("mensaje", tipo);

    div.innerHTML = `<div class="burbuja">${texto}</div>`;

    body.appendChild(div);

    scrollBottom();
}

// Renderiza tarjetas de juegos en el chat
function renderCards(titulo, juegos){
    agregarMensaje(titulo, 'bot');

    juegos.forEach(j => {
        const card = document.createElement('div');
        card.className = 'game-card';

        const img = document.createElement('img');
        img.src = j.imagen || '';
        img.alt = j.nombre || '';

        const info = document.createElement('div');
        info.className = 'game-info';

        const h4 = document.createElement('h4');
        h4.textContent = j.nombre || 'Sin nombre';

        const pGenero = document.createElement('p');
        pGenero.textContent = (j.genero ? j.genero + ' • ' : '') + (j.plataforma || '');

        const pDev = document.createElement('p');
        pDev.textContent = j.desarrolladora || '';

        const precio = document.createElement('div');
        precio.className = 'precio';
        precio.textContent = (typeof j.precio !== 'undefined') ? ('S/ ' + j.precio) : '';

        const btn = document.createElement('button');
        btn.className = 'btn-carrito';
        btn.textContent = 'Agregar al carrito';

        info.appendChild(h4);
        info.appendChild(pGenero);
        info.appendChild(pDev);
        info.appendChild(precio);
        info.appendChild(btn);

        card.appendChild(img);
        card.appendChild(info);

        const wrapper = document.createElement('div');
        wrapper.className = 'mensaje bot';
        const inner = document.createElement('div');
        inner.className = 'burbuja';
        inner.appendChild(card);
        wrapper.appendChild(inner);
        body.appendChild(wrapper);
        scrollBottom();
    });
}

// ===============================
// TYPING
// ===============================

function mostrarTyping(show){
    typing.style.display = show ? "block" : "none";
}

// ===============================
// SCROLL
// ===============================

function scrollBottom(){
    body.scrollTop = body.scrollHeight;
}

});