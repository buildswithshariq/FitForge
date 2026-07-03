"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Activity, Target, Droplets, Dumbbell, Zap } from "lucide-react"
import { GoalInsightsResult } from "@/services/goal-engine.service"

interface ProgressInsightsProps {
  insights: GoalInsightsResult | null
}

export function ProgressInsights({ insights }: ProgressInsightsProps) {
  if (!insights) return null

  return (
    <div className="space-y-6 mt-12 print:hidden">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Goal Insights</h2>
        <p className="text-muted-foreground mt-1">Deep analysis of your performance and adherence.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Adherence Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Adherence Scores
            </CardTitle>
            <CardDescription>Your consistency across key metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Goal Score</span>
                <span className="font-bold">{insights.scores.overall}/100</span>
              </div>
              <Progress value={insights.scores.overall} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Target className="h-3 w-3"/> Nutrition</span>
                <span>{insights.scores.nutrition}/100</span>
              </div>
              <Progress value={insights.scores.nutrition} className="h-1.5" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Dumbbell className="h-3 w-3"/> Workout</span>
                <span>{insights.scores.workout}/100</span>
              </div>
              <Progress value={insights.scores.workout} className="h-1.5" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Droplets className="h-3 w-3"/> Hydration</span>
                <span>{insights.scores.hydration}/100</span>
              </div>
              <Progress value={insights.scores.hydration} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Analytics & Predictions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" /> Predictions & Analytics
            </CardTitle>
            <CardDescription>Based on rolling averages (up to 30 days)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Weekly Deficit</p>
                <p className="text-xl font-bold">{insights.weeklyInsights.averageDeficit} kcal</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Goal Success Rate</p>
                <p className="text-xl font-bold">{insights.weeklyInsights.goalSuccessRate}%</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Weekly Weight Δ</p>
                <p className="text-xl font-bold">{insights.predictions.averageWeeklyWeightChange ? `${insights.predictions.averageWeeklyWeightChange > 0 ? '+' : ''}${insights.predictions.averageWeeklyWeightChange} kg` : '--'}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Expected (30 days)</p>
                <p className="text-xl font-bold">{insights.predictions.expectedWeightIn30Days ? `${insights.predictions.expectedWeightIn30Days} kg` : '--'}</p>
              </div>
            </div>

            {insights.predictions.expectedGoalCompletionDate && (
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary">Goal Completion Date</p>
                  <p className="text-xs text-primary/80">Estimated based on current trends</p>
                </div>
                <p className="text-lg font-bold text-primary">{new Date(insights.predictions.expectedGoalCompletionDate).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
