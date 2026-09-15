import { getDb } from "@/lib/db";
import type { Member, MemberExperience, PersonOption } from "@/lib/types";

export function getAllPeople(): PersonOption[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, nome, tipo, geracao, cor FROM members ORDER BY tipo DESC, geracao IS NULL, geracao, nome`
    )
    .all() as PersonOption[];
}

export function getMembersOnly(): PersonOption[] {
  const db = getDb();
  return db
    .prepare(`SELECT id, nome, tipo, geracao, cor FROM members WHERE tipo = 'membro' ORDER BY nome`)
    .all() as PersonOption[];
}

export function getOrientadoresOnly(): PersonOption[] {
  const db = getDb();
  return db
    .prepare(`SELECT id, nome, tipo, geracao, cor FROM members WHERE tipo = 'orientador' ORDER BY nome`)
    .all() as PersonOption[];
}

export function getPersonById(id: number): Member | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM members WHERE id = ?`).get(id) as Member | undefined;
}

export function getMemberExperience(memberId: number): MemberExperience | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM member_experience WHERE member_id = ?`).get(memberId) as
    | MemberExperience
    | undefined;
}

export function getMemberInterests(memberId: number): string[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT tema FROM member_interests WHERE member_id = ? ORDER BY tema`)
    .all(memberId) as { tema: string }[];
  return rows.map((r) => r.tema);
}

export function getMemberTravelCities(memberId: number): string[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT cidade FROM member_travel_cities WHERE member_id = ? ORDER BY cidade`)
    .all(memberId) as { cidade: string }[];
  return rows.map((r) => r.cidade);
}

export interface CongressHistoryRow {
  id: number;
  congress_id: number | null;
  nome_livre: string | null;
  tipo: "ja_foi" | "pretende_ir";
  ano: string | null;
  congresso_nome: string | null;
}

export function getMemberCongressHistory(memberId: number): CongressHistoryRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT h.id, h.congress_id, h.nome_livre, h.tipo, h.ano, c.nome as congresso_nome
       FROM member_congress_history h
       LEFT JOIN congresses c ON c.id = h.congress_id
       WHERE h.member_id = ?
       ORDER BY h.ano DESC`
    )
    .all(memberId) as CongressHistoryRow[];
}

export function productionScore(exp: MemberExperience | undefined): number {
  if (!exp) return 0;
  return (
    exp.apresent_autor_local +
    exp.apresent_coautor_local +
    exp.apresent_autor_nacional +
    exp.apresent_coautor_nacional +
    exp.resumos_anais +
    exp.capitulos_livro +
    exp.artigos_revista +
    exp.organizacao_eventos
  );
}
