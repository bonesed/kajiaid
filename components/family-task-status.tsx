"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

interface FamilyMember {
  id: string
  name: string
  image?: string
  tasksCompleted: number
  totalTasks: number
  progress: number
}

export function FamilyTaskStatus() {
  const { toast } = useToast()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 家族メンバーとタスク状況を取得
  const fetchFamilyTaskStatus = async () => {
    try {
      setIsLoading(true)

      // 家族メンバーを取得
      const familyResponse = await fetch("/api/family")

      if (!familyResponse.ok) {
        throw new Error("家族メンバーの取得に失敗しました")
      }

      const members = await familyResponse.json()

      // 各メンバーのタスク状況を取得
      const membersWithTasks = await Promise.all(
        members.map(async (member: any) => {
          try {
            const tasksResponse = await fetch(`/api/tasks?userId=${member.id}`)

            if (!tasksResponse.ok) {
              throw new Error(`${member.name}のタスク取得に失敗しました`)
            }

            const tasks = await tasksResponse.json()
            const completedTasks = tasks.filter((task: any) => task.completed)

            return {
              id: member.id,
              name: member.name,
              image: member.image,
              tasksCompleted: completedTasks.length,
              totalTasks: tasks.length,
              progress: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
            }
          } catch (error) {
            console.error(`${member.name}のタスク取得エラー:`, error)
            return {
              id: member.id,
              name: member.name,
              image: member.image,
              tasksCompleted: 0,
              totalTasks: 0,
              progress: 0,
            }
          }
        }),
      )

      setFamilyMembers(membersWithTasks)
    } catch (error) {
      console.error("家族タスク状況取得エラー:", error)
      toast({
        title: "エラー",
        description: "家族のタスク状況の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // コンポーネントのマウント時にデータを取得
  useEffect(() => {
    fetchFamilyTaskStatus()
  }, [])

  // ローディング中の表示
  if (isLoading) {
    return <div className="flex justify-center p-4">読み込み中...</div>
  }

  // データがない場合の表示
  if (familyMembers.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">家族メンバーが登録されていません</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {familyMembers.map((member) => (
        <div key={member.id} className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={member.image || "/placeholder.svg?height=40&width=40"} alt={member.name} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">{member.name}</p>
              <p className="text-sm text-muted-foreground">
                {member.tasksCompleted}/{member.totalTasks}
              </p>
            </div>
            <Progress value={member.progress} className="h-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

