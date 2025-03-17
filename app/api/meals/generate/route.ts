import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const body = await req.json()
    const { days = 7, preferences = [], restrictions = [] } = body

    // ユーザーの好みと制限事項を取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      include: {
        familyPreferences: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
    }

    // AIに渡すプロンプトを構築
    const prompt = `
      ${days}日分の献立を作成してください。
      
      好み: ${[...preferences, ...(user.familyPreferences?.preferences || [])].join(", ")}
      
      制限事項: ${[...restrictions, ...(user.familyPreferences?.restrictions || [])].join(", ")}
      
      各日の献立には主菜、副菜、汁物を含めてください。
      材料リストも各献立ごとに提供してください。
    `

    // AIを使用して献立を生成
    const result = await generateObject({
      model: openai("gpt-4o"),
      system: "あなたは栄養バランスの良い献立を提案する専門家です。",
      prompt,
      schema: z.object({
        mealPlan: z.array(
          z.object({
            day: z.number().describe("何日目かを示す数字"),
            mainDish: z.string().describe("主菜の名前"),
            sideDish: z.string().describe("副菜の名前"),
            soup: z.string().describe("汁物の名前"),
            ingredients: z.array(z.string()).describe("必要な材料のリスト"),
          }),
        ),
      }),
    })

    // 生成された献立をデータベースに保存
    const savedMeals = await Promise.all(
      result.object.mealPlan.map(async (meal, index) => {
        const date = new Date()
        date.setDate(date.getDate() + index)

        return prisma.meal.create({
          data: {
            userId: session.user.id as string,
            date,
            mainDish: meal.mainDish,
            sideDish: meal.sideDish,
            soup: meal.soup,
            ingredients: meal.ingredients,
          },
        })
      }),
    )

    return NextResponse.json({ mealPlan: result.object.mealPlan, savedMeals })
  } catch (error) {
    console.error("献立生成エラー:", error)
    return NextResponse.json({ error: "献立の生成に失敗しました" }, { status: 500 })
  }
}

