import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllWorks } from "@/lib/queries/works";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const trabalhos = getAllWorks();

  const csv = toCsv(
    ["Título", "Tipo", "Destino", "Autor principal", "Coautores", "Orientador", "Prazo", "Status", "Link"],
    trabalhos.map((w) => [
      w.titulo,
      w.tipo,
      w.congresso_nome || w.revista_nome,
      w.autor_nome,
      w.coautores.map((c) => c.nome).join("; "),
      w.orientador_nome,
      w.prazo_submissao,
      w.status,
      w.link,
    ])
  );

  return csvResponse("trabalhos.csv", csv);
}
