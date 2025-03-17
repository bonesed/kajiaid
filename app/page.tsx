import { redirect } from "next/navigation"

export default function Home() {
  console.log("Redirecting to /dashboard..."); // 変更を検出させる
  redirect("/dashboard")
}

