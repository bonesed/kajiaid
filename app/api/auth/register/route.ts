import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    // 入力値の検証
    if (!name || !email || !password) {
      return NextResponse.json({ error: "名前、メールアドレス、パスワードは必須です" }, { status: 400 })
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "有効なメールアドレスを入力してください" }, { status: 400 })
    }

    // パスワードの長さチェック
    if (password.length < 8) {
      return NextResponse.json({ error: "パスワードは8文字以上である必要があります" }, { status: 400 })
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "このメールアドレスは既に使用されています" }, { status: 409 })
    }

    // パスワードのハッシュ化
    const hashedPassword = await hash(password, 10)

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // パスワードを除外したユーザー情報を返す
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: "ユーザーが正常に登録されました",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("ユーザー登録エラー:", error)
    return NextResponse.json({ error: "ユーザー登録中にエラーが発生しました" }, { status: 500 })
  }
}

