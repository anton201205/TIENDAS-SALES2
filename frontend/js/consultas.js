async function consultarPC() {

    const res = await fetch("http://127.0.0.1:5000/prolog/pc");
    const data = await res.json();

    document.getElementById("resultadoConsulta").innerHTML =
        data.join("<br>");
}

async function consultarShooter() {

    const res = await fetch("http://127.0.0.1:5000/prolog/shooter");
    const data = await res.json();

    document.getElementById("resultadoConsulta").innerHTML =
        data.join("<br>");
}

async function consultarDesarrolladoras() {

    const res = await fetch(
        "http://127.0.0.1:5000/prolog/desarrolladoras"
    );

    const data = await res.json();

    document.getElementById("resultadoConsulta").innerHTML =
        "<ul><li>" + data.join("</li><li>") + "</li></ul>";
}