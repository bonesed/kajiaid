"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Task {
  id: string
  title: string
  completed: boolean
  assignee: {
    id: string
    name: string
    image?: string
  }
  priority: string
  dueTime: string
}

// TaskListPropsインターフェースを更新
interface TaskListProps {
  extended?: boolean
  filter?: string // 'all', 'mine', 'pending', 'completed', 'today', 'upcoming'
}

export function TaskList({ extended = false, filter }: TaskListProps) {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    assigneeId: "",
    priority: "中",
    dueDate: "",
    dueTime: "",
  })
  const [familyMembers, setFamilyMembers] = useState([])

  // fetchTasks関数を更新して、フィルタリングをサポート
  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      let url = "/api/tasks"

      // フィルターに基づいてURLパラメータを追加
      if (filter) {
        const params = new URLSearchParams()

        if (filter === "mine") {
          // 自分のタスクのみ取得（実際のユーザーIDは認証から取得する必要がある）
          params.append("assigneeId", "current-user")
        } else if (filter === "completed") {
          params.append("status", "completed")
        } else if (filter === "pending") {
          params.append("status", "pending")
        } else if (filter === "today") {
          const today = new Date().toISOString().split("T")[0]
          params.append("dueDate", today)
        } else if (filter === "upcoming") {
          const today = new Date().toISOString().split("T")[0]
          params.append("fromDate", today)
        }

        if (params.toString()) {
          url += `?${params.toString()}`
        }
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("タスクの取得に失敗しました")
      }

      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error("タスク取得エラー:", error)
      toast({
        title: "エラー",
        description: "タスクの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 家族メンバー一覧を取得
  const fetchFamilyMembers = async () => {
    try {
      const response = await fetch("/api/family")

      if (!response.ok) {
        throw new Error("家族メンバーの取得に失敗しました")
      }

      const data = await response.json()
      setFamilyMembers(data)
    } catch (error) {
      console.error("家族メンバー取得エラー:", error)
    }
  }

  // タスクの完了状態を更新
  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !completed }),
      })

      if (!response.ok) {
        throw new Error("タスクの更新に失敗しました")
      }

      // 成功したら、ローカルの状態を更新
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !completed } : task)))

      toast({
        title: completed ? "タスクを未完了に戻しました" : "タスクを完了しました",
        description: "タスクの状態を更新しました",
      })
    } catch (error) {
      console.error("タスク更新エラー:", error)
      toast({
        title: "エラー",
        description: "タスクの更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  // 新しいタスクを作成
  const createTask = async () => {
    try {
      if (!newTask.title) {
        toast({
          title: "入力エラー",
          description: "タスク名を入力してください",
          variant: "destructive",
        })
        return
      }

      const dueDateTime = newTask.dueDate && newTask.dueTime ? `${newTask.dueDate}T${newTask.dueTime}:00` : undefined

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask.title,
          assigneeId: newTask.assigneeId,
          priority: newTask.priority,
          dueDate: dueDateTime,
        }),
      })

      if (!response.ok) {
        throw new Error("タスクの作成に失敗しました")
      }

      // 成功したら、ダイアログを閉じて、タスク一覧を再取得
      setIsDialogOpen(false)
      setNewTask({
        title: "",
        assigneeId: "",
        priority: "中",
        dueDate: "",
        dueTime: "",
      })
      fetchTasks()

      toast({
        title: "タスクを作成しました",
        description: "新しいタスクが追加されました",
      })
    } catch (error) {
      console.error("タスク作成エラー:", error)
      toast({
        title: "エラー",
        description: "タスクの作成に失敗しました",
        variant: "destructive",
      })
    }
  }

  // useEffectを更新して、フィルターが変更されたときにタスクを再取得
  useEffect(() => {
    fetchTasks()
    fetchFamilyMembers()
  }, [filter])

  // ローディング中の表示
  if (isLoading) {
    return <div className="flex justify-center p-4">読み込み中...</div>
  }

  // タスクがない場合の表示
  if (tasks.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground mb-4">タスクがありません</p>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新しいタスクを追加
        </Button>
      </div>
    )
  }

  // If not extended, only show first 4 tasks
  const displayTasks = extended ? tasks : tasks.slice(0, 4)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {displayTasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTaskCompletion(task.id, task.completed)}
              />
              <label
                htmlFor={`task-${task.id}`}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                  task.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.title}
              </label>
              {extended && (
                <Badge
                  variant={task.priority === "高" ? "destructive" : task.priority === "中" ? "default" : "outline"}
                  className="ml-2"
                >
                  {task.priority}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {extended && <span className="text-sm text-muted-foreground">{task.dueTime}</span>}
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={task.assignee.image || "/placeholder.svg?height=32&width=32"}
                  alt={task.assignee.name}
                />
                <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {extended && (
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
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
              新しいタスクを追加
            </Button>
          ) : (
            tasks.length > 4 && (
              <Button variant="link" className="w-full">
                すべてのタスクを表示
              </Button>
            )
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しいタスク</DialogTitle>
            <DialogDescription>新しいタスクの詳細を入力してください</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">タスク名</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="タスク名を入力"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">担当者</Label>
              <Select
                value={newTask.assigneeId}
                onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="担当者を選択" />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map((member: any) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">優先度</Label>
              <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="優先度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="高">高</SelectItem>
                  <SelectItem value="中">中</SelectItem>
                  <SelectItem value="低">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">期日</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueTime">時間</Label>
                <Input
                  id="dueTime"
                  type="time"
                  value={newTask.dueTime}
                  onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={createTask}>作成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

