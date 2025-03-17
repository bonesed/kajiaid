"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Filter, Plus } from "lucide-react"
import { TaskList } from "@/components/task-list"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function TasksPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [filter, setFilter] = useState("all") // all, mine, pending, completed
  const [view, setView] = useState("list") // list, calendar

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    toast({
      title: "フィルター変更",
      description: `${
        newFilter === "all"
          ? "すべてのタスク"
          : newFilter === "mine"
            ? "自分のタスク"
            : newFilter === "pending"
              ? "未完了のタスク"
              : "完了したタスク"
      }を表示しています`,
    })
  }

  const handleViewChange = (newView: string) => {
    setView(newView)
    toast({
      title: "表示切替",
      description: `${newView === "list" ? "リスト" : "カレンダー"}表示に切り替えました`,
    })
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">タスク管理</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                フィルター
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleFilterChange("all")}>すべて</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("mine")}>自分のタスク</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("pending")}>未完了</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("completed")}>完了済み</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={() => handleViewChange(view === "list" ? "calendar" : "list")}>
            <Calendar className="mr-2 h-4 w-4" />
            {view === "list" ? "カレンダー表示" : "リスト表示"}
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新しいタスク
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="today">今日</TabsTrigger>
          <TabsTrigger value="upcoming">今後</TabsTrigger>
          <TabsTrigger value="completed">完了済み</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>すべてのタスク</CardTitle>
              <CardDescription>家族全員のタスクを管理します</CardDescription>
            </CardHeader>
            <CardContent>
              {view === "list" ? (
                <TaskList extended filter={filter} />
              ) : (
                <div className="h-96 flex items-center justify-center border rounded-lg">
                  <p className="text-muted-foreground">カレンダー表示（開発中）</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>今日のタスク</CardTitle>
              <CardDescription>今日完了すべきタスク</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList extended filter="today" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>今後のタスク</CardTitle>
              <CardDescription>今後予定されているタスク</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList extended filter="upcoming" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>完了済みタスク</CardTitle>
              <CardDescription>完了したタスクの履歴</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList extended filter="completed" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

