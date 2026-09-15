import { getDb } from "@/lib/db";
import type { StatusCongresso } from "@/lib/types";

export interface CongressOption {
  id: number;
  nome: string;
}

export function getCongressOptions(): CongressOption[] {
  const db = getDb();
  return db.prepare(`SELECT id, nome FROM congresses ORDER BY prazo_submissao IS NULL, prazo_submissao`).all() as CongressOption[];
}

export interface Congress {
  id: number;
  nome: string;
  area: string | null;
  cidade: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  prazo_submissao: string | null;
  link: string | null;
  valor_inscricao: string | null;
  status: StatusCongresso;
  created_at: string;
}

export function getCongressById(id: number): Congress | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM congresses WHERE id = ?`).get(id) as Congress | undefined;
}

export function getCongressResponsibleIds(congressId: number): number[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT member_id FROM congress_responsibles WHERE congress_id = ?`)
    .all(congressId) as { member_id: number }[];
  return rows.map((r) => r.member_id);
}

export function getAllCongresses(): Congress[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM congresses ORDER BY prazo_submissao IS NULL, prazo_submissao`).all() as Congress[];
}
