import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/db"

// タスク一覧を取得
export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")

    const where: any = {}

    // ユーザーIDでフィルタリング
    if (userId) {
      where.assigneeId = userId
    }

    // ステータスでフィルタリング
    if (status === "completed") {
      where.completed = true
    } else if (status === "pending") {
      where.completed = false
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("タスク取得エラー:", error)
    return NextResponse.json({ error: "タスクの取得に失敗しました" }, { status: 500 })
  }
}

// 新しいタスクを作成
export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, assigneeId, priority, dueDate } = body

    if (!title) {
      return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assigneeId,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        completed: false,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("タスク作成エラー:", error)
    return NextResponse.json({ error: "タスクの作成に失敗しました" }, { status: 500 })
  }
}

