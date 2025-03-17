"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WeatherForecast } from "@/components/weather-forecast"
import { LaundryAdvice } from "@/components/laundry-advice"

export default function LaundryPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">洗濯アドバイス</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>天気予報</CardTitle>
            <CardDescription>今後3日間の天気予報</CardDescription>
          </CardHeader>
          <CardContent>
            <WeatherForecast extended />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>洗濯アドバイス</CardTitle>
            <CardDescription>天気に基づいた洗濯のアドバイス</CardDescription>
          </CardHeader>
          <CardContent>
            <LaundryAdvice extended />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

