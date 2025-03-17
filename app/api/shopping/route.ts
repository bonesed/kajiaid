import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/db"

// 買い物リスト一覧を取得
export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const purchased = searchParams.get("purchased")

    const where: any = {}

    // カテゴリでフィルタリング
    if (category) {
      where.category = category
    }

    // 購入済みかどうかでフィルタリング
    if (purchased === "true") {
      where.purchased = true
    } else if (purchased === "false") {
      where.purchased = false
    }

    const items = await prisma.shoppingItem.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("買い物リスト取得エラー:", error)
    return NextResponse.json({ error: "買い物リストの取得に失敗しました" }, { status: 500 })
  }
}

// 新しい買い物アイテムを追加
export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const body = await req.json()
    const { name, quantity, category } = body

    if (!name) {
      return NextResponse.json({ error: "商品名は必須です" }, { status: 400 })
    }

    const item = await prisma.shoppingItem.create({
      data: {
        name,
        quantity,
        category,
        purchased: false,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("買い物アイテム作成エラー:", error)
    return NextResponse.json({ error: "買い物アイテムの作成に失敗しました" }, { status: 500 })
  }
}

