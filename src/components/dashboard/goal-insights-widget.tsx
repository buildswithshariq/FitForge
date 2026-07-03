"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Lightbulb } from "lucide-react"

interface GoalInsightsWidgetProps {
  insights: {
    scores: { overall: number };
    dailyFeedback: string[];
    recommendations: string[];
    predictions: { expectedGoalCompletionDate: string | null };
  } | null
}

export function GoalInsightsWidget({ insights }: GoalInsightsWidgetProps) {
  if (!insights) return null

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Goal Engine
            </CardTitle>
            <CardDescription>Real-time insights and recommendations</CardDescription>
          </div>
          <Badge variant={insights.scores.overall > 75 ? "default" : (insights.scores.overall > 50 ? "secondary" : "destructive")} className="text-lg px-3 py-1">
            Score: {insights.scores.overall}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Daily Feedback
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            {insights.dailyFeedback.map((fb, i) => (
              <li key={i}>{fb}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" /> Recommendations
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            {insights.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>

        {insights.predictions.expectedGoalCompletionDate && (
          <div className="pt-2 border-t mt-4">
            <p className="text-xs text-muted-foreground">
              Estimated Completion: <span className="font-semibold">{new Date(insights.predictions.expectedGoalCompletionDate).toLocaleDateString()}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
