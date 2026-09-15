// Roster pré-cadastrado de membros do Projeto Nariz, por geração.
// Edite esta lista para adicionar gerações/membros novos — a cor da
// geração segue a rotação azul -> vermelho -> verde -> amarelo
// automaticamente (ver data/geracoes.js), a menos que "cor" seja
// definida explicitamente abaixo.
const { corPorIndice } = require("./geracoes");

const GERACOES_BASE = [
  {
    nome: "Xaxim",
    membros: [
      "Bárbara Mascarenhas Pinheiro",
      "Bianca Batista Diniz Freitas",
      "Carla Loiola Ponte Batista",
      "Fernanda de Oliveira Paula",
      "Giovana Barroso de Melo Rios",
      "Isaac de Sales Oliveira da Costa",
      "Laysa Kimberly Garcia Gomes",
      "Manuela Silveira Sant'Ana",
      "Maria Ivonildes Gomes Rios Vital",
      "Marilia Teixeira Rodrigues Martins",
      "Matheus Fernandes Maciel",
    ],
  },
  {
    nome: "Xulipel",
    membros: [
      "Ana Clara Maia Ramalho",
      "Ana Beatriz Macêdo Prata",
      "Ana Carolina Albuquerque Aragão",
      "Dennyse Araújo Andrade",
      "Eugênia Mirza de Queiroz Ferreira Barboza da Silveira",
      "Isabele Macêdo Prata",
      "Ivan Bonfim Jacó de Oliveira",
      "Lara Hitzschky Previdelli",
      "Marília de Brito Ricarte",
      "Marina Albuquerque de Sousa Santos",
      "Sofia Duboc de Albuquerque",
    ],
  },
  {
    nome: "Xarponguees",
    membros: [
      "Anndressa Vitória Mascarenhas Veronese",
      "Arthur Holanda Moreira",
      "Beatriz Pinheiro Moreira de Andrade",
      "Iris Lopes Veras",
      "Laís Mesquita Câmara",
      "Larissa Ferreira Monteiro",
      "Pauline Braga Pina",
      "Priscila Carneiro Lima",
      "Taynah Temóteo Macêdo",
      "Vivian Miranda Dos Santos",
    ],
  },
  {
    nome: "Ximarcleiv",
    membros: [
      "Beatriz Diniz Oliveira",
      "Bruna Viana Teles Rebouças",
      "Danyela Polary Bessa Parente",
      "Emanuelle de Vasconcelos Lobo",
      "Iranise Ramalho Lima Martins",
      "Mariana Bezerra Leite",
      "Mayara dos Santos Sousa",
      "Saulo de Tarso Camello de Oliveira",
      "Stella Maria Macêdo",
      "Thalia Lopes da Cunha",
    ],
  },
  {
    nome: "Xivicas",
    membros: [
      "Ana Valeska da Silva",
      "Giovanna Walfredo de Carvalho Linhares",
      "Júlia Leitão Cabral",
      "Maria Eduarda Soares dos Santos",
      "Marina Lacombe Oliva da Fonseca",
      "Marina Sampaio Pereira",
      "Milena Agnes Santos Bueno",
      "Thiago Bomfim de Saboia",
      "Victória Maria Serpa Gaspar",
      "Vitória Gomes Andrade",
    ],
  },
  {
    nome: "Xeblekivis",
    membros: [
      "Amanda de Alevir",
      "Beatriz Vieira Cavalcante",
      "Lívia Dodt Coelho",
      "Eduarda Telles Diógenes Vasques",
      "Mirella Lima Fontenele",
      "Luana Osterno Luna",
      "Iasmin Diniz Teixeira de Paula",
      "Luan Bezerra de Oliveira",
      "Giulia Maslowa Menezes Vieira",
      "Isabella Silva de Sousa",
      "Maria Clara Arraes de Figueiredo",
    ],
  },
  {
    nome: "Xopivitos",
    membros: [
      "Bruno Santos de Souza Siébra",
      "Beatriz Pinheiro Rabelo Ricarte",
      "Camila Espíndola Jefferson Frota",
      "Helena Aben-Athar Ponte",
      "Helena Picanço de Melo",
      "José Gabriel Lopes Nunes Fernandes",
      "Julia Cristina Iosi Cardillo",
      "Lena Rodrigues Picanço",
      "Lucas Mesquita Câmara",
      "Sofia Maria Torres Sampaio Leite",
    ],
  },
  {
    nome: "Xermigulhas",
    membros: [
      "Clara Lousada",
      "Lívia",
      "Maria Clara God",
      "Mafe",
      "Marina Calado",
      "Sara Brito",
      "Stela",
      "Sarah",
      "Lia Mabel",
      "Emely",
      "Marina Ribeiro",
      "Julia",
      "Gabi Bonatto",
    ],
  },
];

const GERACOES = GERACOES_BASE.map((geracao, indice) => ({
  ...geracao,
  cor: geracao.cor || corPorIndice(indice),
}));

const MEMBROS = GERACOES.flatMap((geracao) =>
  geracao.membros.map((nome) => ({ nome, geracao: geracao.nome, cor: geracao.cor }))
);

module.exports = { GERACOES, MEMBROS };
