import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get("lat") || "35.6895"
    const lon = searchParams.get("lon") || "139.6917"

    // OpenWeatherMap APIを使用して天気情報を取得
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error("天気情報の取得に失敗しました")
    }

    const data = await response.json()

    // 3日分の天気予報を抽出
    const forecast = data.list.filter((item: any, index: number) => index % 8 === 0).slice(0, 3)

    // 洗濯に適した日かどうかを判定
    const processedForecast = forecast.map((item: any) => {
      const weather = item.weather[0]
      const temp = item.main.temp
      const humidity = item.main.humidity
      const windSpeed = item.wind.speed

      // 洗濯スコアの計算（晴れで温度が高く、湿度が低く、風が適度にある日が良い）
      let laundryScore = 0

      // 天気による評価（晴れ: 50点、曇り: 30点、雨: 0点）
      if (weather.main === "Clear") {
        laundryScore += 50
      } else if (weather.main === "Clouds") {
        laundryScore += 30
      }

      // 温度による評価（15℃以上で加点、最大30点）
      laundryScore += Math.min(Math.max(0, temp - 15) * 2, 30)

      // 湿度による評価（湿度が低いほど良い、最大10点）
      laundryScore += Math.max(0, 10 - (humidity - 40) / 6)

      // 風速による評価（適度な風があると良い、最大10点）
      laundryScore += Math.min(windSpeed * 2, 10)

      // スコアを0-100の範囲に収める
      laundryScore = Math.min(Math.max(0, Math.round(laundryScore)), 100)

      return {
        date: item.dt_txt.split(" ")[0],
        weather: weather.main,
        description: weather.description,
        temp: Math.round(temp),
        humidity,
        windSpeed,
        icon: weather.icon,
        laundryScore,
      }
    })

    return NextResponse.json(processedForecast)
  } catch (error) {
    console.error("天気情報取得エラー:", error)
    return NextResponse.json({ error: "天気情報の取得に失敗しました" }, { status: 500 })
  }
}

