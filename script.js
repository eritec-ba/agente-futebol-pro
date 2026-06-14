const API_KEY = "2fb66ea0327b48219aa690455c419237";
const BASE_URL = "https://api.football-data.org/v4";

// Função principal
async function analisarPartida() {
    const timeCasa = document.getElementById("timeCasa").value.trim();
    const timeFora = document.getElementById("timeFora").value.trim();
    const resultadoDiv = document.getElementById("resultado");

    if (!timeCasa || !timeFora) {
        resultadoDiv.innerHTML = "<p style='color: red;'>⚠️ Preencha os dois times!</p>";
        return;
    }

    resultadoDiv.innerHTML = "<p>🔄 Buscando dados... Aguarde.</p>";

    try {
        // Buscar IDs dos times
        const idCasa = await buscarIdTime(timeCasa);
        const idFora = await buscarIdTime(timeFora);

        if (!idCasa || !idFora) {
            resultadoDiv.innerHTML = "<p style='color: red;'>❌ Um dos times não foi encontrado.</p>";
            return;
        }

        let html = `<h2>⚽ ${timeCasa} vs ${timeFora}</h2>`;

        // Últimas partidas do time da casa
        html += `<h3>📊 Últimas partidas do ${timeCasa}</h3>`;
        html += await getUltimasPartidas(idCasa, timeCasa);

        // Últimas partidas do time de fora
        html += `<h3>📊 Últimas partidas do ${timeFora}</h3>`;
        html += await getUltimasPartidas(idFora, timeFora);

        resultadoDiv.innerHTML = html;

