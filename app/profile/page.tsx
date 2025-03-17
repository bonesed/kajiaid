"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  name: string
  email: string
  image?: string
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [name, setName] = useState("")
  const [image, setImage] = useState("")

  // プロフィール情報を取得
  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/profile")

      if (!response.ok) {
        throw new Error("プロフィール情報の取得に失敗しました")
      }

      const data = await response.json()
      setProfile(data)
      setName(data.name || "")
      setImage(data.image || "")
    } catch (error) {
      console.error("プロフィール取得エラー:", error)
      toast({
        title: "エラー",
        description: "プロフィール情報の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // プロフィールを更新
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          image,
        }),
      })

      if (!response.ok) {
        throw new Error("プロフィールの更新に失敗しました")
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)

      // セッションも更新
      await update({
        ...session,
        user: {
          ...session?.user,
          name,
          image,
        },
      })

      toast({
        title: "プロフィールを更新しました",
        description: "プロフィール情報が正常に更新されました",
      })
    } catch (error) {
      console.error("プロフィール更新エラー:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "プロフィールの更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // コンポーネントのマウント時にプロフィール情報を取得
  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="container max-w-md py-10">
        <div className="flex justify-center p-4">プロフィール情報を読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.image || "/placeholder.svg?height=96&width=96"} alt={profile?.name || ""} />
              <AvatarFallback>{profile?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-center">{profile?.name || "ユーザー"}</CardTitle>
          <CardDescription className="text-center">{profile?.email}</CardDescription>
        </CardHeader>
        <form onSubmit={updateProfile}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">お名前</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">プロフィール画像URL</Label>
              <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
              <p className="text-xs text-muted-foreground">画像のURLを入力してください</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating ? "更新中..." : "プロフィールを更新"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

