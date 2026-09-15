export type Role = "membro" | "coordenadora" | "presidencia";

export type StatusMembro = "efetivo" | "afetivo";

export type InteresseIC = "sim" | "nao_prioridade" | "nao";

export type TipoPessoa = "membro" | "orientador";

export type StatusCongresso = "planejado" | "confirmado" | "em_andamento" | "concluido";

export type StatusIdeia = "ideia" | "em_avaliacao" | "aprovada" | "descartada";

export type TipoTrabalho =
  | "resumo_simples"
  | "resumo_expandido"
  | "trabalho_completo"
  | "capitulo_livro"
  | "artigo"
  | "relato_caso"
  | "relato_experiencia";

export type DestinoTrabalho = "congresso" | "revista";

export type StatusTrabalho =
  | "escrevendo"
  | "revisao"
  | "submetido"
  | "aprovado"
  | "apresentado"
  | "publicado";

export interface PersonOption {
  id: number;
  nome: string;
  tipo: TipoPessoa;
  geracao: string | null;
  cor: string | null;
}

export interface Member {
  id: number;
  nome: string;
  tipo: TipoPessoa;
  geracao: string | null;
  cor: string | null;
  curso: string | null;
  semestre: string | null;
  status: StatusMembro | null;
  data_entrada: string | null;
  interesse_ic: InteresseIC | null;
  obs_disponibilidade: string | null;
  matricula: string | null;
  documento: string | null;
  created_at: string;
}

export interface MemberExperience {
  member_id: number;
  apresent_autor_local: number;
  apresent_coautor_local: number;
  apresent_autor_nacional: number;
  apresent_coautor_nacional: number;
  resumos_anais: number;
  capitulos_livro: number;
  artigos_revista: number;
  organizacao_eventos: number;
}

export const TEMAS_SUGERIDOS = [
  "Pediatria",
  "Cuidados Paliativos",
  "Oncologia",
  "Psiquiatria",
  "Geriatria",
  "Nutrição",
  "Luto",
  "Saúde Mental",
  "Arteterapia",
  "Comunicação",
  "Educação em Saúde",
];

export const TIPOS_TRABALHO: { value: TipoTrabalho; label: string }[] = [
  { value: "resumo_simples", label: "Resumo simples" },
  { value: "resumo_expandido", label: "Resumo expandido" },
  { value: "trabalho_completo", label: "Trabalho completo" },
  { value: "capitulo_livro", label: "Capítulo de livro/ebook" },
  { value: "artigo", label: "Artigo em revista" },
  { value: "relato_caso", label: "Relato de caso" },
  { value: "relato_experiencia", label: "Relato de experiência" },
];

export const STATUS_TRABALHO: { value: StatusTrabalho; label: string }[] = [
  { value: "escrevendo", label: "Escrevendo" },
  { value: "revisao", label: "Revisão" },
  { value: "submetido", label: "Submetido" },
  { value: "aprovado", label: "Aprovado" },
  { value: "apresentado", label: "Apresentado" },
  { value: "publicado", label: "Publicado" },
];

export const STATUS_CONGRESSO: { value: StatusCongresso; label: string }[] = [
  { value: "planejado", label: "Planejado" },
  { value: "confirmado", label: "Confirmado" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
];

export const STATUS_IDEIA: { value: StatusIdeia; label: string }[] = [
  { value: "ideia", label: "Ideia" },
  { value: "em_avaliacao", label: "Em avaliação" },
  { value: "aprovada", label: "Aprovada" },
  { value: "descartada", label: "Descartada" },
];

export const ROLE_LABEL: Record<Role, string> = {
  membro: "Membro",
  coordenadora: "Coordenadora",
  presidencia: "Presidência",
};
