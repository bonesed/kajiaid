"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, CheckCircle, CloudSun, ShoppingCart, Utensils } from "lucide-react"
import { TaskList } from "@/components/task-list"
import { MealPlan } from "@/components/meal-plan"
import { LaundryAdvice } from "@/components/laundry-advice"
import { WeatherForecast } from "@/components/weather-forecast"
import { FamilyTaskStatus } from "@/components/family-task-status"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function DashboardPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [isGeneratingMeal, setIsGeneratingMeal] = useState(false)
  const [isMealDialogOpen, setIsMealDialogOpen] = useState(false)
  const [preferences, setPreferences] = useState("")
  const [restrictions, setRestrictions] = useState("")
  const [taskCount, setTaskCount] = useState({ total: 0, completed: 0 })
  const [weather, setWeather] = useState<any>(null)
  const [shoppingCount, setShoppingCount] = useState(0)
  const [todayMeal, setTodayMeal] = useState<any>(null)

  // ダッシュボードデータを取得
  const fetchDashboardData = async () => {
    try {
      // タスク数を取得
      const tasksResponse = await fetch("/api/tasks")
      if (tasksResponse.ok) {
        const tasks = await tasksResponse.json()
        setTaskCount({
          total: tasks.length,
          completed: tasks.filter((task: any) => task.completed).length,
        })
      }

      // 今日の天気を取得
      const weatherResponse = await fetch("/api/weather")
      if (weatherResponse.ok) {
        const weatherData = await weatherResponse.json()
        setWeather(weatherData[0])
      }

      // 買い物リスト数を取得
      const shoppingResponse = await fetch("/api/shopping?purchased=false")
      if (shoppingResponse.ok) {
        const items = await shoppingResponse.json()
        setShoppingCount(items.length)
      }

      // 今日の献立を取得
      const today = new Date().toISOString().split("T")[0]
      const mealsResponse = await fetch(`/api/meals?startDate=${today}&endDate=${today}`)
      if (mealsResponse.ok) {
        const meals = await mealsResponse.json()
        if (meals.length > 0) {
          setTodayMeal(meals[0])
        }
      }
    } catch (error) {
      console.error("ダッシュボードデータ取得エラー:", error)
    }
  }

  // AIによる献立生成
  const generateMeals = async () => {
    try {
      setIsGeneratingMeal(true)

      // 好みと制限事項を配列に変換
      const preferencesArray = preferences
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item)

      const restrictionsArray = restrictions
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item)

      const response = await fetch("/api/meals/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          days: 7,
          preferences: preferencesArray,
          restrictions: restrictionsArray,
        }),
      })

      if (!response.ok) {
        throw new Error("献立の生成に失敗しました")
      }

      // 成功したら、ダイアログを閉じて、ダッシュボードデータを再取得
      setIsMealDialogOpen(false)
      setPreferences("")
      setRestrictions("")
      fetchDashboardData()

      toast({
        title: "献立を生成しました",
        description: "新しい献立が追加されました",
      })
    } catch (error) {
      console.error("献立生成エラー:", error)
      toast({
        title: "エラー",
        description: "献立の生成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingMeal(false)
    }
  }

  const handleQuickAction = (action: string) => {
    if (action === "新しいタスク") {
      setActiveTab("tasks")
    } else if (action === "献立生成") {
      setIsMealDialogOpen(true)
    }

    toast({
      title: "クイックアクション",
      description: `${action}を開始しました`,
    })
  }

  // コンポーネントのマウント時にデータを取得
  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">ダッシュボード</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleQuickAction("新しいタスク")}>新しいタスク</Button>
          <Button variant="outline" onClick={() => handleQuickAction("献立生成")}>
            献立生成
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="tasks">タスク管理</TabsTrigger>
          <TabsTrigger value="meals">献立・買い物</TabsTrigger>
          <TabsTrigger value="laundry">洗濯アドバイス</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今日のタスク</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {taskCount.completed}/{taskCount.total}
                </div>
                <p className="text-xs text-muted-foreground">{taskCount.completed}つのタスクが完了しました</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今日の献立</CardTitle>
                <Utensils className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayMeal?.mainDish || "未設定"}</div>
                <p className="text-xs text-muted-foreground">
                  {todayMeal
                    ? todayMeal.status === "材料あり"
                      ? "材料はすべて揃っています"
                      : "買い物が必要です"
                    : "献立を生成してください"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">天気予報</CardTitle>
                <CloudSun className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {weather ? `${weather.description} ${weather.temp}°C` : "読み込み中..."}
                </div>
                <p className="text-xs text-muted-foreground">
                  {weather && weather.laundryScore > 70
                    ? "洗濯に最適な日です"
                    : weather && weather.laundryScore > 40
                      ? "洗濯可能です"
                      : weather
                        ? "洗濯には適していません"
                        : ""}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">買い物リスト</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shoppingCount} アイテム</div>
                <p className="text-xs text-muted-foreground">
                  {shoppingCount > 0 ? `${shoppingCount}個のアイテムが未購入です` : "買い物リストは空です"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>今日のタスク</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>家族のタスク状況</CardTitle>
              </CardHeader>
              <CardContent>
                <FamilyTaskStatus />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>今週の献立</CardTitle>
              </CardHeader>
              <CardContent>
                <MealPlan />
              </CardContent>
            </Card>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>洗濯アドバイス</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <WeatherForecast />
                <LaundryAdvice />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>タスク管理</CardTitle>
              <CardDescription>家族で共有するタスクを管理します</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      すべて
                    </Button>
                    <Button variant="outline" size="sm">
                      自分のタスク
                    </Button>
                    <Button variant="outline" size="sm">
                      未完了
                    </Button>
                  </div>
                  <Button>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    カレンダー表示
                  </Button>
                </div>
                <TaskList extended />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>献立・買い物</CardTitle>
              <CardDescription>AIが好みに合わせた献立を提案します</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      今週の献立
                    </Button>
                    <Button variant="outline" size="sm">
                      買い物リスト
                    </Button>
                    <Button variant="outline" size="sm">
                      在庫管理
                    </Button>
                  </div>
                  <Button onClick={() => setIsMealDialogOpen(true)}>
                    <Utensils className="mr-2 h-4 w-4" />
                    献立生成
                  </Button>
                </div>
                <MealPlan extended />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laundry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>洗濯アドバイス</CardTitle>
              <CardDescription>天気予報に基づいた最適な洗濯のアドバイスを提供します</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <WeatherForecast extended />
                <LaundryAdvice extended />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isMealDialogOpen} onOpenChange={setIsMealDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>献立生成</DialogTitle>
            <DialogDescription>AIが好みに合わせた献立を提案します</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preferences">好みの食材や料理（カンマ区切り）</Label>
              <Textarea
                id="preferences"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="例: 和食, 魚料理, 野菜中心"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restrictions">制限事項（カンマ区切り）</Label>
              <Textarea
                id="restrictions"
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                placeholder="例: 乳製品アレルギー, 辛いもの苦手, グルテンフリー"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMealDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={generateMeals} disabled={isGeneratingMeal}>
              {isGeneratingMeal ? "生成中..." : "生成"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

