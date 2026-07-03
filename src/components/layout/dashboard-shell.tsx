"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Activity, 
  BarChart3, 
  Dumbbell, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  Settings, 
  Utensils 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth/client"
import { useRouter } from "next/navigation"

interface DashboardShellProps {
  children: React.ReactNode
  user: {
    id: string
    name: string
    email: string
  }
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workouts", href: "/workouts", icon: Dumbbell },
    { name: "Diet", href: "/diet", icon: Utensils },
    { name: "Plans", href: "/plans", icon: Activity },
    { name: "Progress", href: "/progress", icon: BarChart3 },
    { name: "Fitness Tools", href: "/tools/bmi", icon: Activity },
    { name: "Settings", href: "/profile", icon: Settings },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 print:bg-white print:min-h-0">
      {/* Topbar for mobile */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden print:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          className="sm:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Activity className="h-5 w-5 text-primary" />
          <span>FitForge</span>
        </Link>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex-col border-r bg-background transition-transform sm:static sm:flex sm:translate-x-0 print:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 hidden sm:flex">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Activity className="h-6 w-6 text-primary" />
              <span className="">FitForge</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      isActive ? "bg-muted text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm sm:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto print:p-0 print:overflow-visible print:w-full print:block">
          {children}
        </main>
      </div>
    </div>
  )
}
