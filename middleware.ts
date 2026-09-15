import { NextRequest, NextResponse } from "next/server";
import { unsealData } from "iron-session";
import { sessionOptions, type SessionData } from "./lib/session";

const PUBLIC_PATHS = new Set(["/login", "/acesso-negado"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const cookieName = sessionOptions.cookieName as string;
  const cookie = request.cookies.get(cookieName)?.value;
  let session: SessionData | null = null;

  if (cookie) {
    try {
      session = await unsealData<SessionData>(cookie, { password: sessionOptions.password });
    } catch {
      session = null;
    }
  }

  if (!session?.userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    pathname.startsWith("/restrita") &&
    session.role !== "coordenadora" &&
    session.role !== "presidencia"
  ) {
    return NextResponse.redirect(new URL("/acesso-negado", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
