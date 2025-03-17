import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/db"

// タスクの詳細を取得
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("タスク取得エラー:", error)
    return NextResponse.json({ error: "タスクの取得に失敗しました" }, { status: 500 })
  }
}

// タスクを更新
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, assigneeId, priority, dueDate, completed } = body

    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate)
    if (completed !== undefined) updateData.completed = completed

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("タスク更新エラー:", error)
    return NextResponse.json({ error: "タスクの更新に失敗しました" }, { status: 500 })
  }
}

// タスクを削除
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("タスク削除エラー:", error)
    return NextResponse.json({ error: "タスクの削除に失敗しました" }, { status: 500 })
  }
}

