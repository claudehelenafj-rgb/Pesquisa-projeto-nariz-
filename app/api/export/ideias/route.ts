import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllIdeas } from "@/lib/queries/ideas";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const ideias = getAllIdeas();

  const csv = toCsv(
    ["Título", "Eixo temático", "Proposta por", "Orientador sugerido", "Status", "Participantes", "Criada em"],
    ideias.map((i) => [
      i.titulo,
      i.eixo_tematico,
      i.proposta_por_nome,
      i.orientador_nome,
      i.status,
      i.participantes.map((p) => p.nome).join("; "),
      i.created_at,
    ])
  );

  return csvResponse("ideias.csv", csv);
}
