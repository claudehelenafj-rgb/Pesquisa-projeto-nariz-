import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { toCsv, csvResponse } from "@/lib/csv";
import type { Member } from "@/lib/types";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo") || "membro";
  const geracao = searchParams.get("geracao") || "";
  const status = searchParams.get("status") || "";

  const db = getDb();
  let sql = `SELECT * FROM members WHERE tipo = ?`;
  const args: (string | number)[] = [tipo];
  if (geracao) {
    sql += ` AND geracao = ?`;
    args.push(geracao);
  }
  if (status) {
    sql += ` AND status = ?`;
    args.push(status);
  }
  sql += ` ORDER BY geracao, nome`;

  const membros = db.prepare(sql).all(...args) as Member[];

  const csv = toCsv(
    ["Nome", "Geração", "Curso", "Semestre", "Status", "Data de entrada", "Interesse em IC"],
    membros.map((m) => [m.nome, m.geracao, m.curso, m.semestre, m.status, m.data_entrada, m.interesse_ic])
  );

  return csvResponse("membros.csv", csv);
}
