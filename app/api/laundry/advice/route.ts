import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const body = await req.json()
    const { weather, laundryAmount } = body

    if (!weather || laundryAmount === undefined) {
      return NextResponse.json({ error: "天気情報と洗濯物の量は必須です" }, { status: 400 })
    }

    // AIによる洗濯アドバイスを生成
    const prompt = `
      今日の天気: ${weather.weather}
      気温: ${weather.temp}°C
      湿度: ${weather.humidity}%
      風速: ${weather.windSpeed}m/s
      洗濯物の量: ${laundryAmount}%
      
      上記の条件に基づいて、洗濯に関するアドバイスを100文字程度で提供してください。
      洗濯のタイミング、干し方、乾燥時間の目安などを含めてください。
    `

    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt,
    })

    return NextResponse.json({ advice: text })
  } catch (error) {
    console.error("洗濯アドバイス生成エラー:", error)
    return NextResponse.json({ error: "洗濯アドバイスの生成に失敗しました" }, { status: 500 })
  }
}

