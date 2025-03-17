import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/db"

// 買い物アイテムの詳細を取得
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const item = await prisma.shoppingItem.findUnique({
      where: { id: params.id },
    })

    if (!item) {
      return NextResponse.json({ error: "アイテムが見つかりません" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("アイテム取得エラー:", error)
    return NextResponse.json({ error: "アイテムの取得に失敗しました" }, { status: 500 })
  }
}

// 買い物アイテムを更新
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const body = await req.json()
    const { name, quantity, category, purchased } = body

    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (quantity !== undefined) updateData.quantity = quantity
    if (category !== undefined) updateData.category = category
    if (purchased !== undefined) updateData.purchased = purchased

    const item = await prisma.shoppingItem.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("アイテム更新エラー:", error)
    return NextResponse.json({ error: "アイテムの更新に失敗しました" }, { status: 500 })
  }
}

// 買い物アイテムを削除
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    await prisma.shoppingItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("アイテム削除エラー:", error)
    return NextResponse.json({ error: "アイテムの削除に失敗しました" }, { status: 500 })
  }
}

