import { getDb } from "@/lib/db";
import type { StatusIdeia } from "@/lib/types";

export interface Idea {
  id: number;
  titulo: string;
  descricao: string | null;
  proposta_por: number | null;
  eixo_tematico: string | null;
  orientador_sugerido: number | null;
  status: StatusIdeia;
  created_at: string;
}

export interface IdeaWithRelations extends Idea {
  proposta_por_nome: string | null;
  proposta_por_geracao: string | null;
  proposta_por_cor: string | null;
  orientador_nome: string | null;
  participantes: { id: number; nome: string; geracao: string | null; cor: string | null }[];
}

export function getAllIdeas(eixo?: string): IdeaWithRelations[] {
  const db = getDb();
  let sql = `
    SELECT i.*, p.nome as proposta_por_nome, p.geracao as proposta_por_geracao, p.cor as proposta_por_cor,
           o.nome as orientador_nome
    FROM ideas i
    LEFT JOIN members p ON p.id = i.proposta_por
    LEFT JOIN members o ON o.id = i.orientador_sugerido
  `;
  const args: string[] = [];
  if (eixo) {
    sql += ` WHERE i.eixo_tematico = ?`;
    args.push(eixo);
  }
  sql += ` ORDER BY i.created_at DESC`;

  const rows = db.prepare(sql).all(...args) as (Idea & {
    proposta_por_nome: string | null;
    proposta_por_geracao: string | null;
    proposta_por_cor: string | null;
    orientador_nome: string | null;
  })[];

  const partStmt = db.prepare(
    `SELECT m.id, m.nome, m.geracao, m.cor FROM idea_participants ip
     JOIN members m ON m.id = ip.member_id WHERE ip.idea_id = ? ORDER BY m.nome`
  );

  return rows.map((r) => ({
    ...r,
    participantes: partStmt.all(r.id) as IdeaWithRelations["participantes"],
  }));
}

export function getIdeaById(id: number): IdeaWithRelations | undefined {
  const all = getAllIdeas();
  return all.find((i) => i.id === id);
}

export function getDistinctEixos(): string[] {
  const db = getDb();
  return (
    db
      .prepare(
        `SELECT DISTINCT eixo_tematico FROM ideas WHERE eixo_tematico IS NOT NULL AND eixo_tematico != '' ORDER BY eixo_tematico`
      )
      .all() as { eixo_tematico: string }[]
  ).map((r) => r.eixo_tematico);
}

export interface IdeaComment {
  id: number;
  idea_id: number;
  member_id: number | null;
  texto: string;
  created_at: string;
  autor_nome: string | null;
}

export function getIdeaComments(ideaId: number): IdeaComment[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT c.*, m.nome as autor_nome FROM idea_comments c
       LEFT JOIN members m ON m.id = c.member_id
       WHERE c.idea_id = ? ORDER BY c.created_at ASC`
    )
    .all(ideaId) as IdeaComment[];
}
