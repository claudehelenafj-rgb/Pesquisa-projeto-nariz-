import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllCongresses } from "@/lib/queries/congresses";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const congressos = getAllCongresses();

  const csv = toCsv(
    ["Nome", "Área", "Cidade", "Início", "Fim", "Prazo de submissão", "Status", "Responsáveis"],
    congressos.map((c) => [
      c.nome,
      c.area,
      c.cidade,
      c.data_inicio,
      c.data_fim,
      c.prazo_submissao,
      c.status,
      c.responsaveis.map((r) => r.nome).join("; "),
    ])
  );

  return csvResponse("congressos.csv", csv);
}
