import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, ArrowRight, BarChart3, Dumbbell, Droplets, Utensils } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">FitForge</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="#testimonials">
            Testimonials
          </Link>
          <div className="flex gap-2">
            <Link href="/login" className="hidden sm:inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-muted hover:text-foreground h-8 px-3">
              Login
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium h-8 px-3">
              Get Started
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]" />
          
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Forge your best self with <span className="text-primary">Data</span> & <span className="text-primary">Discipline</span>.
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  The ultimate fitness tracker. Log workouts, track nutrition, monitor hydration, and follow AI-ready personalized plans all in one place.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 min-w-[200px]">
                <Link href="/signup" className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium h-12 px-8 gap-2">
                  Start Your Journey <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center rounded-lg border border-input bg-background hover:bg-muted text-foreground text-sm font-medium h-12 px-8">
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
                  Everything you need
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">One platform for total fitness</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Stop switching between 5 different apps. FitForge brings your entire health ecosystem into a single, beautifully designed dashboard.
                </p>
              </div>
            </div>
            
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="group relative overflow-hidden rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Dumbbell className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Workout Logging</h3>
                <p className="text-muted-foreground">Track sets, reps, and weights with our massive exercise database and smart templates.</p>
              </div>
              
              <div className="group relative overflow-hidden rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Utensils className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Nutrition & Macros</h3>
                <p className="text-muted-foreground">Log your meals and hit your protein goals with our integrated food database.</p>
              </div>
              
              <div className="group relative overflow-hidden rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Droplets className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Hydration Tracker</h3>
                <p className="text-muted-foreground">Never forget to drink water. Set daily goals and track your fluid intake effortlessly.</p>
              </div>
              
              <div className="group relative overflow-hidden rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Smart Analytics</h3>
                <p className="text-muted-foreground">Visualize your progress with beautiful charts that track volume, weight, and consistency.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2026 FitForge. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
