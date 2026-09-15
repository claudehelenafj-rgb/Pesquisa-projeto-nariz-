import { getDb } from "@/lib/db";

export interface SearchResults {
  membros: { id: number; nome: string; geracao: string | null; cor: string | null }[];
  congressos: { id: number; nome: string; cidade: string | null; area: string | null }[];
  ideias: { id: number; titulo: string; eixo_tematico: string | null }[];
  trabalhos: { id: number; titulo: string; tipo: string }[];
}

export function globalSearch(query: string): SearchResults {
  const db = getDb();
  const q = `%${query}%`;

  const membros = db
    .prepare(
      `SELECT id, nome, geracao, cor FROM members WHERE nome LIKE ? COLLATE NOCASE ORDER BY nome LIMIT 15`
    )
    .all(q) as SearchResults["membros"];

  const congressos = db
    .prepare(
      `SELECT id, nome, cidade, area FROM congresses
       WHERE nome LIKE ? COLLATE NOCASE OR area LIKE ? COLLATE NOCASE OR cidade LIKE ? COLLATE NOCASE
       ORDER BY nome LIMIT 15`
    )
    .all(q, q, q) as SearchResults["congressos"];

  const ideias = db
    .prepare(
      `SELECT id, titulo, eixo_tematico FROM ideas
       WHERE titulo LIKE ? COLLATE NOCASE OR eixo_tematico LIKE ? COLLATE NOCASE
       ORDER BY created_at DESC LIMIT 15`
    )
    .all(q, q) as SearchResults["ideias"];

  const trabalhos = db
    .prepare(`SELECT id, titulo, tipo FROM works WHERE titulo LIKE ? COLLATE NOCASE ORDER BY updated_at DESC LIMIT 15`)
    .all(q) as SearchResults["trabalhos"];

  const memberIdsByTheme = db
    .prepare(
      `SELECT DISTINCT m.id, m.nome, m.geracao, m.cor FROM member_interests mi
       JOIN members m ON m.id = mi.member_id
       WHERE mi.tema LIKE ? COLLATE NOCASE LIMIT 15`
    )
    .all(q) as SearchResults["membros"];

  const seen = new Set(membros.map((m) => m.id));
  for (const m of memberIdsByTheme) {
    if (!seen.has(m.id)) {
      membros.push(m);
      seen.add(m.id);
    }
  }

  return { membros, congressos, ideias, trabalhos };
}
