"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Utensils } from "lucide-react"
import { MealPlan } from "@/components/meal-plan"
import { ShoppingList } from "@/components/shopping-list"
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

export default function MealsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("meals")
  const [isMealDialogOpen, setIsMealDialogOpen] = useState(false)
  const [isGeneratingMeal, setIsGeneratingMeal] = useState(false)
  const [preferences, setPreferences] = useState("")
  const [restrictions, setRestrictions] = useState("")

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

      // 成功したら、ダイアログを閉じる
      setIsMealDialogOpen(false)
      setPreferences("")
      setRestrictions("")

      toast({
        title: "献立を生成しました",
        description: "新しい献立が追加されました",
      })
    } catch (error) {
      console.error("献立生成エラー:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "献立の生成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingMeal(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">献立・買い物</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setActiveTab("shopping")}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            買い物リスト
          </Button>
          <Button onClick={() => setIsMealDialogOpen(true)}>
            <Utensils className="mr-2 h-4 w-4" />
            献立生成
          </Button>
        </div>
      </div>

      <Tabs defaultValue="meals" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="meals">献立</TabsTrigger>
          <TabsTrigger value="shopping">買い物リスト</TabsTrigger>
          <TabsTrigger value="inventory">在庫管理</TabsTrigger>
        </TabsList>

        <TabsContent value="meals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>今週の献立</CardTitle>
              <CardDescription>AIが生成した献立プラン</CardDescription>
            </CardHeader>
            <CardContent>
              <MealPlan extended />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shopping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>買い物リスト</CardTitle>
              <CardDescription>献立に必要な食材リスト</CardDescription>
            </CardHeader>
            <CardContent>
              <ShoppingList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>在庫管理</CardTitle>
              <CardDescription>家にある食材の管理</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center border rounded-lg">
                <p className="text-muted-foreground">在庫管理機能（開発中）</p>
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

