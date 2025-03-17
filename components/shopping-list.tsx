"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ShoppingItem {
  id: string
  name: string
  quantity: string
  category: string
  purchased: boolean
}

export function ShoppingList() {
  const { toast } = useToast()
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    category: "その他",
  })

  // 買い物リストを取得
  const fetchShoppingList = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/shopping")

      if (!response.ok) {
        throw new Error("買い物リストの取得に失敗しました")
      }

      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error("買い物リスト取得エラー:", error)
      toast({
        title: "エラー",
        description: "買い物リストの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 新しいアイテムを追加
  const addItem = async () => {
    try {
      if (!newItem.name) {
        toast({
          title: "入力エラー",
          description: "商品名を入力してください",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/shopping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      })

      if (!response.ok) {
        throw new Error("アイテムの追加に失敗しました")
      }

      // 成功したら、フォームをリセットして、リストを再取得
      setNewItem({
        name: "",
        quantity: "",
        category: "その他",
      })
      fetchShoppingList()

      toast({
        title: "アイテムを追加しました",
        description: `${newItem.name}を買い物リストに追加しました`,
      })
    } catch (error) {
      console.error("アイテム追加エラー:", error)
      toast({
        title: "エラー",
        description: "アイテムの追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  // アイテムの購入状態を更新
  const toggleItemPurchased = async (itemId: string, purchased: boolean) => {
    try {
      const response = await fetch(`/api/shopping/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ purchased: !purchased }),
      })

      if (!response.ok) {
        throw new Error("アイテムの更新に失敗しました")
      }

      // 成功したら、ローカルの状態を更新
      setItems(items.map((item) => (item.id === itemId ? { ...item, purchased: !purchased } : item)))

      toast({
        title: purchased ? "未購入に戻しました" : "購入済みにしました",
        description: "アイテムの状態を更新しました",
      })
    } catch (error) {
      console.error("アイテム更新エラー:", error)
      toast({
        title: "エラー",
        description: "アイテムの更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  // アイテムを削除
  const deleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/shopping/${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("アイテムの削除に失敗しました")
      }

      // 成功したら、ローカルの状態を更新
      setItems(items.filter((item) => item.id !== itemId))

      toast({
        title: "アイテムを削除しました",
        description: "買い物リストからアイテムを削除しました",
      })
    } catch (error) {
      console.error("アイテム削除エラー:", error)
      toast({
        title: "エラー",
        description: "アイテムの削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  // コンポーネントのマウント時にデータを取得
  useEffect(() => {
    fetchShoppingList()
  }, [])

  // ローディング中の表示
  if (isLoading) {
    return <div className="flex justify-center p-4">読み込み中...</div>
  }

  // カテゴリーでアイテムをグループ化
  const groupedItems = items.reduce(
    (acc, item) => {
      const category = item.category || "その他"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    },
    {} as Record<string, ShoppingItem[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor="itemName">商品名</Label>
          <Input
            id="itemName"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="例: 牛乳"
          />
        </div>
        <div className="w-24 space-y-2">
          <Label htmlFor="quantity">数量</Label>
          <Input
            id="quantity"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            placeholder="例: 1L"
          />
        </div>
        <div className="w-32 space-y-2">
          <Label htmlFor="category">カテゴリー</Label>
          <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="カテゴリー" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="野菜・果物">野菜・果物</SelectItem>
              <SelectItem value="肉・魚">肉・魚</SelectItem>
              <SelectItem value="乳製品">乳製品</SelectItem>
              <SelectItem value="調味料">調味料</SelectItem>
              <SelectItem value="飲料">飲料</SelectItem>
              <SelectItem value="その他">その他</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={addItem}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {Object.keys(groupedItems).length === 0 ? (
        <div className="text-center p-4 border rounded-lg">
          <p className="text-muted-foreground">買い物リストは空です</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category}>
              <h3 className="text-sm font-medium mb-2">{category}</h3>
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 border"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.purchased}
                        onCheckedChange={() => toggleItemPurchased(item.id, item.purchased)}
                      />
                      <label
                        htmlFor={`item-${item.id}`}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          item.purchased ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {item.name}
                        {item.quantity && <span className="ml-2 text-xs text-muted-foreground">{item.quantity}</span>}
                      </label>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

