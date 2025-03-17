"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function CreateFamilyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [familyName, setFamilyName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/family", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: familyName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "家族の作成に失敗しました")
      }

      toast({
        title: "家族を作成しました",
        description: "家族が正常に作成されました。メンバーを招待できます。",
      })
      router.push("/family")
    } catch (error) {
      console.error("家族作成エラー:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "家族の作成に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>家族を作成</CardTitle>
          <CardDescription>新しい家族グループを作成して、メンバーを招待しましょう</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">家族名</Label>
              <Input
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="例: 山田家"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "作成中..." : "家族を作成"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

