"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CloudSun, Droplets, Sun, Umbrella, Waves } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WeatherData {
  date: string
  weather: string
  description: string
  temp: number
  humidity: number
  windSpeed: number
  icon: string
  laundryScore: number
}

interface WeatherForecastProps {
  extended?: boolean
}

export function WeatherForecast({ extended = false }: WeatherForecastProps) {
  const { toast } = useToast()
  const [forecast, setForecast] = useState<WeatherData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 天気予報を取得
  const fetchWeatherForecast = async () => {
    try {
      setIsLoading(true)

      // 位置情報を取得（実際のアプリでは、ユーザーの位置情報を使用）
      // ここでは東京の座標をデフォルトとして使用
      const lat = "35.6895"
      const lon = "139.6917"

      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)

      if (!response.ok) {
        throw new Error("天気情報の取得に失敗しました")
      }

      const data = await response.json()
      setForecast(data)
    } catch (error) {
      console.error("天気情報取得エラー:", error)
      toast({
        title: "エラー",
        description: "天気情報の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // コンポーネントのマウント時に天気予報を取得
  useEffect(() => {
    fetchWeatherForecast()
  }, [])

  // 天気アイコンを取得
  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "Clear":
        return <Sun className="h-6 w-6 text-yellow-500" />
      case "Clouds":
        return <CloudSun className="h-6 w-6 text-blue-400" />
      case "Rain":
      case "Drizzle":
        return <Umbrella className="h-6 w-6 text-blue-600" />
      default:
        return <CloudSun className="h-6 w-6 text-blue-400" />
    }
  }

  // ローディング中の表示
  if (isLoading) {
    return <div className="flex justify-center p-4">天気情報を読み込み中...</div>
  }

  // データがない場合の表示
  if (forecast.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">天気情報を取得できませんでした</p>
        <button className="text-primary text-sm mt-2" onClick={fetchWeatherForecast}>
          再読み込み
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!extended && (
        <div className="flex justify-between">
          {forecast.map((day, index) => (
            <div key={index} className="flex flex-col items-center justify-center p-2 rounded-lg">
              <span className="text-xs font-medium">{index === 0 ? "今日" : index === 1 ? "明日" : "明後日"}</span>
              <div className="my-1">{getWeatherIcon(day.weather)}</div>
              <span className="text-sm font-bold">{day.temp}°C</span>
              <div className="flex items-center mt-1">
                <Droplets className="h-3 w-3 text-blue-500 mr-1" />
                <span className="text-xs">{day.humidity}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {extended && (
        <div className="grid grid-cols-3 gap-2">
          {forecast.map((day, index) => (
            <Card key={index}>
              <CardContent className="p-3 flex flex-col items-center">
                <div className="flex justify-between w-full mb-2">
                  <span className="text-sm font-medium">{index === 0 ? "今日" : index === 1 ? "明日" : "明後日"}</span>
                  <span className="text-xs text-muted-foreground">{day.date}</span>
                </div>
                <div className="my-2">{getWeatherIcon(day.weather)}</div>
                <span className="text-lg font-bold">{day.temp}°C</span>
                <span className="text-xs text-muted-foreground">{day.description}</span>
                <div className="flex items-center mt-2 w-full justify-between">
                  <div className="flex items-center">
                    <Droplets className="h-3 w-3 text-blue-500 mr-1" />
                    <span className="text-xs">{day.humidity}%</span>
                  </div>
                  <div className="flex items-center">
                    <Waves className="h-3 w-3 text-primary mr-1" />
                    <span className="text-xs">{day.laundryScore}点</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

