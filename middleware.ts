import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // 認証が必要なパス
  const authRequiredPaths = ["/dashboard", "/tasks", "/meals", "/laundry", "/shopping", "/settings"]

  // 認証済みユーザーがアクセスできないパス
  const authNotRequiredPaths = ["/login", "/register", "/forgot-password"]

  const path = request.nextUrl.pathname

  // 認証が必要なパスに未認証でアクセスした場合
  if (authRequiredPaths.some((p) => path.startsWith(p)) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 認証済みユーザーが認証不要なパスにアクセスした場合
  if (authNotRequiredPaths.some((p) => path.startsWith(p)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// ミドルウェアを適用するパス
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/meals/:path*",
    "/laundry/:path*",
    "/shopping/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
}

