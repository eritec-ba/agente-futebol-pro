const API_KEY = "2fb66ea0327b48219aa690455c419237";
const BASE_URL = "https://api.football-data.org/v4";

async function analisarPartida() {
  const timeCasa = document.getElementById("timeCasa").value.trim();
  const timeFora = document.getElementById("timeFora").value.trim();
  const resultado = document.getElementById("resultado");
  const loading = document.getElementById("loading");

  if (!timeCasa || !timeFora) {
    resultado.innerHTML = `<p style="color: #f87171;">⚠️ Por favor, preencha os dois times.</p>`;
    return;
  }

  loading.classList.remove("hidden");
  resultado.innerHTML = "";

  try {
    const idCasa = await getTeamId(timeCasa);
    const idFora = await getTeamId(timeFora);

    const statsCasa = await getTeamStats(idCasa);
    const statsFora = await getTeamStats(idFora);

    let html = `<h2>${timeCasa} vs ${timeFora}</h2>`;

    html += `<h3>📊 Análise do ${timeCasa}</h3>`;
    html += gerarTabelaStats(statsCasa, timeCasa);

    html += `<h3>📊 Análise do ${timeFora}</h3>`;
    html += gerarTabelaStats(statsFora, timeFora);

    html += `<h3>🔍 Avaliação da Partida</h3>`;
    html += gerarAnaliseComparativa(statsCasa, statsFora, timeCasa, timeFora);

    resultado.innerHTML = html;

  } catch (e) {
    resultado.innerHTML = `<p style="color: #f87171;">❌ Erro: ${e.message || 'Tente novamente.'}</p>`;
  } finally {
    loading.classList.add("hidden");
  }
}

async function getTeamId(nome) {
  const res = await fetch(`${BASE_URL}/teams?search=${encodeURIComponent(nome)}`, {
    headers: { "X-Auth-Token": API_KEY }
  });
  const data = await res.json();
  if (data.teams?.length > 0) return data.teams[0].id;
  throw new Error(`Time "${nome}" não encontrado`);
}

async function getTeamStats(teamId) {
  const res = await fetch(`${BASE_URL}/teams/${teamId}/matches?status=FINISHED&limit=10`, {
    headers: { "X-Auth-Token": API_KEY }
  });
  const data = await res.json();
  const matches = data.matches || [];

  let vitorias = 0, empates = 0, derrotas = 0;
  let golsMarcados = 0, golsSofridos = 0;

  matches.forEach(m => {
    const isHome = m.homeTeam.id === teamId;
    const gf = isHome ? m.score.fullTime.home : m.score.fullTime.away;
    const ga = isHome ? m.score.fullTime.away : m.score.fullTime.home;

    golsMarcados += gf;
    golsSofridos += ga;

    if (gf > ga) vitorias++;
    else if (gf === ga) empates++;
    else derrotas++;
  });

  return {
    jogos: matches.length,
    vitorias,
    empates,
    derrotas,
    golsMarcados,
    golsSofridos,
    mediaGolsMarcados: matches.length ? (golsMarcados / matches.length).toFixed(1) : 0,
    mediaGolsSofridos: matches.length ? (golsSofridos / matches.length).toFixed(1) : 0
  };
}

function gerarTabelaStats(stats, nome) {
  const winRate = stats.jogos > 0 ? ((stats.vitorias / stats.jogos) * 100).toFixed(0) : 0;
  return `
    <table>
      <tr><th colspan="2">${nome} (Últimos ${stats.jogos} jogos)</th></tr>
      <tr><td>Vitórias</td><td>${stats.vitorias} (${winRate}%)</td></tr>
      <tr><td>Empates</td><td>${stats.empates}</td></tr>
      <tr><td>Derrotas</td><td>${stats.derrotas}</td></tr>
      <tr><td>Média Gols Marcados</td><td>${stats.mediaGolsMarcados}</td></tr>
      <tr><td>Média Gols Sofridos</td><td>${stats.mediaGolsSofridos}</td></tr>
    </table>
  `;
}

function gerarAnaliseComparativa(sCasa, sFora, nomeCasa, nomeFora) {
  const winRateCasa = sCasa.jogos > 0 ? (sCasa.vitorias / sCasa.jogos) : 0;
  const winRateFora = sFora.jogos > 0 ? (sFora.vitorias / sFora.jogos) : 0;

  let probCasa = Math.round(winRateCasa * 55 + (parseFloat(sCasa.mediaGolsMarcados) - parseFloat(sFora.mediaGolsSofridos)) * 12);
  let probFora = Math.round(winRateFora * 55 + (parseFloat(sFora.mediaGolsMarcados) - parseFloat(sCasa.mediaGolsSofridos)) * 12);
  let probEmpate = Math.max(20, 100 - probCasa - probFora);

  return `
    <p><strong>Estimativa de Probabilidade:</strong></p>
    <ul>
      <li>🏠 <strong>${nomeCasa}</strong> vence → <strong>${probCasa}%</strong></li>
      <li>🤝 Empate → <strong>${probEmpate}%</strong></li>
      <li>✈️ <strong>${nomeFora}</strong> vence → <strong>${probFora}%</strong></li>
    </ul>
    <small>Análise baseada nas últimas 10 partidas de cada time.</small>
  `;
}