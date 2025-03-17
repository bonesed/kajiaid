"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Timer, Waves } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface LaundryAdviceProps {
  extended?: boolean
}

export function LaundryAdvice({ extended = false }: LaundryAdviceProps) {
  const { toast } = useToast()
  const [laundryAmount, setLaundryAmount] = useState(50)
  const [advice, setAdvice] = useState("")
  const [weather, setWeather] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [timerActive, setTimerActive] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerDuration, setTimerDuration] = useState(0)

  // 天気情報を取得
  const fetchWeather = async () => {
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
      setWeather(data[0]) // 今日の天気
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

  // AIによる洗濯アドバイスを生成
  const generateLaundryAdvice = async () => {
    if (!weather) return

    try {
      setIsGenerating(true)

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

      setAdvice(text)
    } catch (error) {
      console.error("アドバイス生成エラー:", error)
      setAdvice("アドバイスの生成に失敗しました。もう一度お試しください。")
    } finally {
      setIsGenerating(false)
    }
  }

  // タイマーをセット
  const startTimer = () => {
    // 洗濯物の量に応じてタイマーの時間を設定（例: 10分〜30分）
    const duration = Math.ceil(10 + laundryAmount / 5)
    setTimerDuration(duration * 60) // 秒に変換
    setTimerSeconds(duration * 60)
    setTimerActive(true)

    toast({
      title: "タイマーをセットしました",
      description: `${duration}分のタイマーを開始しました`,
    })
  }

  // タイマーの進行
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1)
      }, 1000)
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false)
      toast({
        title: "タイマー終了",
        description: "洗濯が完了しました！",
      })
    }

    return () => clearInterval(interval)
  }, [timerActive, timerSeconds, toast])

  // タイマーの表示形式
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  // コンポーネントのマウント時に天気情報を取得
  useEffect(() => {
    fetchWeather()
  }, [])

  // 天気情報が変更されたらアドバイスを生成
  useEffect(() => {
    if (weather) {
      generateLaundryAdvice()
    }
  }, [weather, laundryAmount])

  // ローディング中の表示
  if (isLoading) {
    return <div className="flex justify-center p-4">読み込み中...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">今日の洗濯アドバイス</h3>
          {weather && (
            <p className="text-xs text-muted-foreground">
              天気: {weather.description} {weather.temp}°C、湿度: {weather.humidity}%
            </p>
          )}
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Waves className="h-4 w-4 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        {isGenerating ? (
          <p className="text-sm">アドバイスを生成中...</p>
        ) : (
          <p className="text-sm">{advice || "天気情報に基づいたアドバイスを生成できませんでした。"}</p>
        )}

        {extended && (
          <>
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span>洗濯物の量</span>
                <span>{laundryAmount}%</span>
              </div>
              <Slider
                value={[laundryAmount]}
                min={0}
                max={100}
                step={10}
                onValueChange={(value) => setLaundryAmount(value[0])}
              />
            </div>

            {timerActive && (
              <div className="pt-2">
                <h4 className="text-sm font-medium">タイマー</h4>
                <div className="mt-2">
                  <Progress value={(timerSeconds / timerDuration) * 100} className="h-2" />
                  <p className="text-center text-sm mt-1">{formatTime(timerSeconds)}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" size="sm" onClick={startTimer} disabled={timerActive}>
                <Timer className="mr-2 h-4 w-4" />
                タイマーをセット
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  toast({
                    title: "洗濯を開始しました",
                    description: "洗濯機を起動しました",
                  })
                }}
              >
                洗濯を開始
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

