import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/db"

// 家族メンバー一覧を取得
export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // ユーザーの家族IDを取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { familyId: true },
    })

    if (!user?.familyId) {
      // 家族が設定されていない場合は、自分自身のみを返す
      return NextResponse.json([
        {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image,
        },
      ])
    }

    // 家族メンバーを取得
    const familyMembers = await prisma.user.findMany({
      where: { familyId: user.familyId },
      select: {
        id: true,
        name: true,
        image: true,
      },
    })

    return NextResponse.json(familyMembers)
  } catch (error) {
    console.error("家族メンバー取得エラー:", error)
    return NextResponse.json({ error: "家族メンバーの取得に失敗しました" }, { status: 500 })
  }
}

// 家族を作成
export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const body = await req.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: "家族名は必須です" }, { status: 400 })
    }

    // 家族を作成
    const family = await prisma.family.create({
      data: {
        name,
        members: {
          connect: { id: session.user.id as string },
        },
      },
    })

    // ユーザーの家族IDを更新
    await prisma.user.update({
      where: { id: session.user.id as string },
      data: { familyId: family.id },
    })

    return NextResponse.json(family)
  } catch (error) {
    console.error("家族作成エラー:", error)
    return NextResponse.json({ error: "家族の作成に失敗しました" }, { status: 500 })
  }
}

