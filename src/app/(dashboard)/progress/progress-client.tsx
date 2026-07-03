"use client"

import { useEffect, useState } from "react"
import { getProgressDataAction } from "@/actions/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts"
import { Button } from "@/components/ui/button"
import { Printer, Activity, Scale, TrendingDown, TrendingUp, Dumbbell, Clock, Flame } from "lucide-react"
import { formatDate } from "@/lib/utils/dates"
import { ProgressInsights } from "@/components/progress/progress-insights"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
export function ProgressClient() {
  const [data, setData] = useState<{ weight: any[]; workouts: any[]; snapshots: any[]; insights: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await getProgressDataAction({ days })
      if (res.success && res.data) {
        // @ts-ignore
        setData(res.data)
      }
      setLoading(false)
    }
    load()
  }, [days])

  if (loading) return <div>Loading progress...</div>
  if (!data) return <div>Failed to load data</div>

  const handlePrint = () => {
    window.print()
  }

  const weightData = data?.weight || []
  const workoutData = data?.workouts || []
  
  const currentWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : 0
  const firstWeight = weightData.length > 0 ? weightData[0].weight : 0
  const weightChange = currentWeight - firstWeight
  const isWeightLoss = weightChange <= 0

  const totalWorkouts = workoutData.length
  const avgDuration = totalWorkouts > 0 ? Math.round(workoutData.reduce((acc, curr) => acc + curr.duration, 0) / totalWorkouts) : 0
  const totalCalories = workoutData.reduce((acc, curr) => acc + (curr.calories || 0), 0)

  return (
    <>
      <div className="space-y-8 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
            <p className="text-muted-foreground mt-1">Track your fitness journey and celebrate your wins.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={days.toString()} onValueChange={(v) => setDays(Number(v))}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 3 Months</SelectItem>
                <SelectItem value="180">Last 6 Months</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 h-[38px]">
              <Printer className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-primary/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentWeight > 0 ? `${currentWeight.toFixed(1)} kg` : '--'}</div>
              {weightData.length > 1 && (
                <p className={`text-xs mt-1 flex items-center ${isWeightLoss ? 'text-green-500' : 'text-amber-500'}`}>
                  {isWeightLoss ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                  {Math.abs(weightChange).toFixed(1)} kg from start
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWorkouts}</div>
              <p className="text-xs text-muted-foreground mt-1">Logged sessions</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgDuration} min</div>
              <p className="text-xs text-muted-foreground mt-1">Per workout</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-rose-500/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCalories} kcal</div>
              <p className="text-xs text-muted-foreground mt-1">Total across all workouts</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle>Weight Trend</CardTitle>
              <CardDescription>Visualizing your weight changes over time</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[320px] w-full">
                {weightData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted-foreground)" opacity={0.15} />
                      <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" activeDot={{ r: 6, strokeWidth: 0, fill: "var(--primary)" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <Scale className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">No weight data logged yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle>Workout Duration</CardTitle>
              <CardDescription>Minutes spent exercising per session</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[320px] w-full">
                {workoutData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workoutData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.4}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted-foreground)" opacity={0.15} />
                      <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                        cursor={{ fill: 'var(--muted-foreground)', opacity: 0.1 }}
                      />
                      <Bar dataKey="duration" fill="url(#colorDuration)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <Clock className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">No workouts logged yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <ProgressInsights insights={data.insights} />
      </div>

      {/* Print View */}
      <style type="text/css" media="print">
        {`
          @page { size: A4 portrait; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        `}
      </style>
      <div className="hidden print:block w-full bg-white text-black">
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Fitness Progress Report</h1>
            <p className="text-gray-500 mt-2 font-medium">Generated on {formatDate(new Date())}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <Activity className="h-8 w-8 text-black" />
              <span className="font-bold text-2xl text-gray-900">FitForge</span>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Weight Section */}
          <div className="flex flex-col gap-6 items-start page-break-inside-avoid" style={{ breakInside: 'avoid' }}>
            <div className="w-full">
              <div className="border-2 border-gray-100 rounded-2xl p-6 bg-white shadow-sm w-full h-[350px]">
                {data.weight.length > 0 ? (
                  <LineChart width={700} height={300} data={data.weight}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Line type="monotone" dataKey="weight" stroke="#000000" strokeWidth={4} dot={{ fill: "#000000", r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                  </LineChart>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500 font-medium">No weight data logged yet.</div>
                )}
              </div>
            </div>
            <div className="w-full space-y-4 pt-2">
              <h3 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-100 pb-3">Weight Trend</h3>
              <p className="text-base leading-relaxed text-gray-600">
                This chart visualizes your body weight progression over the selected period. 
                Tracking your weight helps in understanding long-term trends rather than daily fluctuations.
              </p>
              <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-100 mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Key Insight</p>
                <p className="text-sm font-semibold text-gray-900 leading-relaxed">Consistent monitoring ensures you stay aligned with your calorie and nutrition targets.</p>
              </div>
            </div>
          </div>

          {/* Workout Volume Section */}
          <div className="flex flex-col gap-6 items-start page-break-inside-avoid" style={{ breakInside: 'avoid', marginTop: '40px' }}>
            <div className="w-full">
              <div className="border-2 border-gray-100 rounded-2xl p-6 bg-white shadow-sm w-full h-[350px]">
                {data.workouts.length > 0 ? (
                  <BarChart width={700} height={300} data={data.workouts}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <Bar dataKey="duration" fill="#000000" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500 font-medium">No workouts logged yet.</div>
                )}
              </div>
            </div>
            <div className="w-full space-y-4 pt-2">
              <h3 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-100 pb-3">Workout Duration</h3>
              <p className="text-base leading-relaxed text-gray-600">
                This bar chart illustrates the total time dedicated to your workouts. Analyzing your workout volume helps ensure you are maintaining consistency.
              </p>
              <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-100 mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Recommendation</p>
                <p className="text-sm font-semibold text-gray-900 leading-relaxed">Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity each week.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-8 border-t-2 border-gray-200 text-center text-sm font-medium text-gray-500">
          This report was automatically generated. Keep pushing towards your goals!
        </div>
      </div>
    </>
  )
}
