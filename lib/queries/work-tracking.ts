import { getDb } from "@/lib/db";
import type { StatusAprovacaoTrabalho, StatusSimNao } from "@/lib/types";

export interface WorkTrackingRow {
  id: number;
  congress_id: number | null;
  congresso_nome: string | null;
  nome_trabalho: string | null;
  organizador1_id: number | null;
  organizador1_nome: string | null;
  organizador1_geracao: string | null;
  organizador1_cor: string | null;
  organizador2_id: number | null;
  organizador2_nome: string | null;
  organizador2_geracao: string | null;
  organizador2_cor: string | null;
  enviado_orientador: StatusSimNao;
  orientador_corretor_id: number | null;
  orientador_corretor_nome: string | null;
  enviado_congresso: StatusSimNao;
  status_aprovacao: StatusAprovacaoTrabalho;
  certificado_filename: string | null;
  certificado_size: number | null;
  created_at: string;
  updated_at: string;
  participantes: { id: number; nome: string; geracao: string | null; cor: string | null }[];
}

export function getAllWorkTracking(): WorkTrackingRow[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT wt.id, wt.congress_id, c.nome as congresso_nome, wt.nome_trabalho,
              wt.organizador1_id, o1.nome as organizador1_nome, o1.geracao as organizador1_geracao, o1.cor as organizador1_cor,
              wt.organizador2_id, o2.nome as organizador2_nome, o2.geracao as organizador2_geracao, o2.cor as organizador2_cor,
              wt.enviado_orientador, wt.orientador_corretor_id, oc.nome as orientador_corretor_nome,
              wt.enviado_congresso, wt.status_aprovacao,
              wt.certificado_filename, wt.certificado_size,
              wt.created_at, wt.updated_at
       FROM work_tracking wt
       LEFT JOIN congresses c ON c.id = wt.congress_id
       LEFT JOIN members o1 ON o1.id = wt.organizador1_id
       LEFT JOIN members o2 ON o2.id = wt.organizador2_id
       LEFT JOIN members oc ON oc.id = wt.orientador_corretor_id
       ORDER BY wt.created_at DESC`
    )
    .all() as Omit<WorkTrackingRow, "participantes">[];

  const partStmt = db.prepare(
    `SELECT m.id, m.nome, m.geracao, m.cor FROM work_tracking_participants wtp
     JOIN members m ON m.id = wtp.member_id WHERE wtp.tracking_id = ? ORDER BY m.nome`
  );

  return rows.map((r) => ({
    ...r,
    participantes: partStmt.all(r.id) as WorkTrackingRow["participantes"],
  }));
}

export function getWorkTrackingCertificado(id: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT certificado_filename, certificado_mime, certificado_data FROM work_tracking WHERE id = ?`
    )
    .get(id) as
    | { certificado_filename: string | null; certificado_mime: string | null; certificado_data: Buffer | null }
    | undefined;
}
