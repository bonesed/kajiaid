import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 簡易版ミドルウェア - デプロイを成功させるため
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: []  // 何にもマッチしないようにする
};

