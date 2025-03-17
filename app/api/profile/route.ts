import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/db"

// プロフィール情報を取得
export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("プロフィール取得エラー:", error)
    return NextResponse.json({ error: "プロフィールの取得に失敗しました" }, { status: 500 })
  }
}

// プロフィール情報を更新
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const body = await req.json()
    const { name, image } = body

    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (image !== undefined) updateData.image = image

    const user = await prisma.user.update({
      where: { id: session.user.id as string },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("プロフィール更新エラー:", error)
    return NextResponse.json({ error: "プロフィールの更新に失敗しました" }, { status: 500 })
  }
}

