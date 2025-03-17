"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Plus, Utensils } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Meal {
  id: string
  date: string
  mainDish: string
  sideDish: string
  soup: string
  ingredients: string[]
  status: string
}

interface MealPlanProps {
  extended?: boolean
}

export function MealPlan({ extended = false }: MealPlanProps) {
  const { toast } = useToast()
  const [meals, setMeals] = useState<Meal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [preferences, setPreferences] = useState("")
  const [restrictions, setRestrictions] = useState("")

  // 献立一覧を取得
  const fetchMeals = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/meals")

      if (!response.ok) {
        throw new Error("献立の取得に失敗しました")
      }

      const data = await response.json()
      setMeals(data)
    } catch (error) {
      console.error("献立取得エラー:", error)
      toast({
        title: "エラー",
        description: "献立の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // AIによる献立生成
  const generateMeals = async () => {
    try {
      setIsGenerating(true)

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

      // 成功したら、ダイアログを閉じて、献立一覧を再取得
      setIsDialogOpen(false)
      setPreferences("")
      setRestrictions("")
      fetchMeals()

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
      setIsGenerating(false)
    }
  }

  // コンポーネントのマウント時にデータを取得
  useEffect(() => {
    fetchMeals()
  }, [])

  // ローディング中の表示
  if (isLoading) {
    return <div className="flex justify-center p-4">読み込み中...</div>
  }

  // 献立がない場合の表示
  if (meals.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground mb-4">献立がありません</p>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Utensils className="mr-2 h-4 w-4" />
          献立を生成
        </Button>
      </div>
    )
  }

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 曜日を取得
  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString)
    const days = ["日", "月", "火", "水", "木", "金", "土"]
    return days[date.getDay()]
  }

  // If not extended, only show first 3 meals
  const displayMeals = extended ? meals : meals.slice(0, 3)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {displayMeals.map((meal) => (
          <div key={meal.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                <span className="text-xs font-medium text-primary">{formatDate(meal.date)}</span>
                <span className="text-xs text-primary/80">{getDayOfWeek(meal.date)}</span>
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">{meal.mainDish}</p>
                {extended && (
                  <p className="text-xs text-muted-foreground">
                    {meal.sideDish}, {meal.soup}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={meal.status === "材料あり" ? "outline" : "default"} className="ml-2">
                {meal.status}
              </Badge>
              {extended && (
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          {extended ? (
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              献立を生成
            </Button>
          ) : (
            meals.length > 3 && (
              <Button variant="link" className="w-full">
                すべての献立を表示
              </Button>
            )
          )}
        </DialogTrigger>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={generateMeals} disabled={isGenerating}>
              {isGenerating ? "生成中..." : "生成"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

