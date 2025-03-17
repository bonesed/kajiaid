import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const body = await req.json()
    const { email, familyId } = body

    if (!email || !familyId) {
      return NextResponse.json({ error: "メールアドレスと家族IDは必須です" }, { status: 400 })
    }

    // 招待先ユーザーの存在確認
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    })

    if (!invitedUser) {
      return NextResponse.json({ error: "指定されたメールアドレスのユーザーが見つかりません" }, { status: 404 })
    }

    // 家族の存在確認
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: { members: true },
    })

    if (!family) {
      return NextResponse.json({ error: "指定された家族が見つかりません" }, { status: 404 })
    }

    // 招待元ユーザーが家族のメンバーであることを確認
    const isMember = family.members.some((member) => member.id === session.user.id)

    if (!isMember) {
      return NextResponse.json({ error: "この家族のメンバーではありません" }, { status: 403 })
    }

    // 既に家族のメンバーかどうかを確認
    const isAlreadyMember = family.members.some((member) => member.id === invitedUser.id)

    if (isAlreadyMember) {
      return NextResponse.json({ error: "このユーザーは既に家族のメンバーです" }, { status: 400 })
    }

    // 家族にユーザーを追加
    await prisma.family.update({
      where: { id: familyId },
      data: {
        members: {
          connect: { id: invitedUser.id },
        },
      },
    })

    // ユーザーの家族IDを更新
    await prisma.user.update({
      where: { id: invitedUser.id },
      data: { familyId },
    })

    // 実際のアプリでは、ここでメール送信処理を行う
    // 今回はメール送信は省略

    return NextResponse.json({ message: "招待が正常に送信されました" })
  } catch (error) {
    console.error("招待送信エラー:", error)
    return NextResponse.json({ error: "招待の送信に失敗しました" }, { status: 500 })
  }
}

