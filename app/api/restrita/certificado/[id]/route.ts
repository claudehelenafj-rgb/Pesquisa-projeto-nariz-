import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, canAccessRestricted } from "@/lib/auth";
import { getWorkTrackingCertificado } from "@/lib/queries/work-tracking";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  if (!canAccessRestricted(user.role)) {
    return new NextResponse("Acesso não autorizado.", { status: 403 });
  }

  const id = Number(params.id);
  const row = getWorkTrackingCertificado(id);
  if (!row || !row.certificado_data) {
    return new NextResponse("Certificado não encontrado.", { status: 404 });
  }

  const download = request.nextUrl.searchParams.get("download") === "1";

  return new NextResponse(new Uint8Array(row.certificado_data), {
    headers: {
      "Content-Type": row.certificado_mime || "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${row.certificado_filename || "certificado.pdf"}"`,
      "Content-Length": String(row.certificado_data.length),
    },
  });
}
