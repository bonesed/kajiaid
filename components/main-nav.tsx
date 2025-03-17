"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Calendar, Home, ShoppingCart, Utensils, Waves } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

export function MainNav() {
  const pathname = usePathname()
  const isMobile = useMobile()

  const routes = [
    {
      href: "/dashboard",
      label: "ダッシュボード",
      active: pathname === "/dashboard",
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      href: "/tasks",
      label: "タスク管理",
      active: pathname === "/tasks",
      icon: <Calendar className="h-4 w-4 mr-2" />,
    },
    {
      href: "/meals",
      label: "献立・買い物",
      active: pathname === "/meals",
      icon: <Utensils className="h-4 w-4 mr-2" />,
    },
    {
      href: "/laundry",
      label: "洗濯アドバイス",
      active: pathname === "/laundry",
      icon: <Waves className="h-4 w-4 mr-2" />,
    },
    {
      href: "/shopping",
      label: "買い物リスト",
      active: pathname === "/shopping",
      icon: <ShoppingCart className="h-4 w-4 mr-2" />,
    },
  ]

  if (isMobile) {
    return null
  }

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground",
          )}
        >
          {route.icon}
          {route.label}
        </Link>
      ))}
    </nav>
  )
}

