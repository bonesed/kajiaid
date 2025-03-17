"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, UserPlus, Users } from "lucide-react"
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

interface FamilyMember {
  id: string
  name: string
  email: string
  image?: string
}

interface Family {
  id: string
  name: string
  members: FamilyMember[]
}

export default function FamilyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [family, setFamily] = useState<Family | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isSending, setIsSending] = useState(false)

  // 家族情報を取得
  const fetchFamily = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/family")

      if (response.status === 404) {
        // 家族が見つからない場合は作成ページにリダイレクト
        router.push("/family/create")
        return
      }

      if (!response.ok) {
        throw new Error("家族情報の取得に失敗しました")
      }

      const data = await response.json()
      setFamily(data)
    } catch (error) {
      console.error("家族情報取得エラー:", error)
      toast({
        title: "エラー",
        description: "家族情報の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 招待メールを送信
  const sendInvitation = async () => {
    try {
      setIsSending(true)

      if (!inviteEmail) {
        toast({
          title: "入力エラー",
          description: "メールアドレスを入力してください",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/family/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail,
          familyId: family?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "招待の送信に失敗しました")
      }

      toast({
        title: "招待を送信しました",
        description: `${inviteEmail}に招待メールを送信しました`,
      })
      setIsInviteDialogOpen(false)
      setInviteEmail("")
      fetchFamily() // 家族情報を再取得
    } catch (error) {
      console.error("招待送信エラー:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "招待の送信に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // コンポーネントのマウント時に家族情報を取得
  useEffect(() => {
    fetchFamily()
  }, [])

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center p-4">家族情報を読み込み中...</div>
      </div>
    )
  }

  // 家族が見つからない場合（通常はリダイレクトされるため、このケースは少ない）
  if (!family) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>家族が見つかりません</CardTitle>
            <CardDescription>家族を作成して、メンバーを招待しましょう</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/family/create")}>
              <Plus className="mr-2 h-4 w-4" />
              家族を作成
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{family.name}</CardTitle>
              <CardDescription>家族メンバーの管理</CardDescription>
            </div>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  メンバーを招待
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>家族メンバーを招待</DialogTitle>
                  <DialogDescription>招待したい方のメールアドレスを入力してください</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="example@example.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={sendInvitation} disabled={isSending}>
                    {isSending ? "送信中..." : "招待を送信"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">メンバー一覧</h3>
              <span className="text-sm text-muted-foreground">{family.members.length}人</span>
            </div>
            {family.members.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <Users className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">メンバーがいません</p>
                <Button variant="link" onClick={() => setIsInviteDialogOpen(true)}>
                  メンバーを招待する
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {family.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.image || "/placeholder.svg?height=40&width=40"} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

