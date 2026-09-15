// Rotação de cores aplicada às gerações do Projeto Nariz, nesta ordem.
// Ao cadastrar uma nova geração em data/membros.js, a próxima cor da
// rotação é aplicada automaticamente (ver corPorIndice).
const ROTACAO_CORES = ["azul", "vermelho", "verde", "amarelo"];

function corPorIndice(indice) {
  return ROTACAO_CORES[indice % ROTACAO_CORES.length];
}

const HEX_POR_COR = {
  azul: "#3B82F6",
  vermelho: "#EF4444",
  verde: "#22C55E",
  amarelo: "#EAB308",
};

module.exports = { ROTACAO_CORES, corPorIndice, HEX_POR_COR };
