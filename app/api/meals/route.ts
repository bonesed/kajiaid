import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/db"

// 献立一覧を取得
export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {
      userId: session.user.id as string,
    }

    // 日付範囲でフィルタリング
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      }
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      }
    } else {
      // デフォルトでは今日以降の献立を取得
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      where.date = {
        gte: today,
      }
    }

    const meals = await prisma.meal.findMany({
      where,
      orderBy: {
        date: "asc",
      },
    })

    return NextResponse.json(meals)
  } catch (error) {
    console.error("献立取得エラー:", error)
    return NextResponse.json({ error: "献立の取得に失敗しました" }, { status: 500 })
  }
}

// 新しい献立を作成
export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const body = await req.json()
    const { date, mainDish, sideDish, soup, ingredients, status } = body

    if (!date || !mainDish) {
      return NextResponse.json({ error: "日付と主菜は必須です" }, { status: 400 })
    }

    const meal = await prisma.meal.create({
      data: {
        userId: session.user.id as string,
        date: new Date(date),
        mainDish,
        sideDish,
        soup,
        ingredients: ingredients || [],
        status: status || "買い物必要",
      },
    })

    return NextResponse.json(meal)
  } catch (error) {
    console.error("献立作成エラー:", error)
    return NextResponse.json({ error: "献立の作成に失敗しました" }, { status: 500 })
  }
}

