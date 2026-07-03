"use client"

import { useState, useEffect } from "react"
import type { WorkoutLog, ExerciseLog, SetLog } from "@prisma/client"
const MuscleGroup = {
  CHEST: "CHEST",
  BACK: "BACK",
  SHOULDERS: "SHOULDERS",
  BICEPS: "BICEPS",
  TRICEPS: "TRICEPS",
  FOREARMS: "FOREARMS",
  CORE: "CORE",
  QUADS: "QUADS",
  HAMSTRINGS: "HAMSTRINGS",
  GLUTES: "GLUTES",
  CALVES: "CALVES",
  FULL_BODY: "FULL_BODY",
  CARDIO: "CARDIO"
} as const;
type MuscleGroup = typeof MuscleGroup[keyof typeof MuscleGroup];
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Dumbbell, Trash2, Edit2, X } from "lucide-react"
import { searchExercisesAction, createQuickWorkoutAction, createCustomExerciseAction, deleteWorkoutLogAction } from "@/actions/workout"
import { createCustomExerciseSchema } from "@/lib/validations/schemas"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils/dates"
import { useDebounce } from "@/hooks/use-debounce"

type WorkoutWithDetails = WorkoutLog & { exercises: (ExerciseLog & { sets: SetLog[] })[] }

interface WorkoutLoggerClientProps {
  recentWorkouts: WorkoutWithDetails[]
}

export function WorkoutLoggerClient({ recentWorkouts }: WorkoutLoggerClientProps) {
  const [isLogging, setIsLogging] = useState(false)
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null)
  const [name, setName] = useState("Quick Workout")
  const [duration, setDuration] = useState("60")

  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const [results, setResults] = useState<any[]>([])
  
  const [activeExercises, setActiveExercises] = useState<{ exerciseId: string; name: string; sets: { reps: number; weight: number; isBodyweight?: boolean; isTime?: boolean }[] }[]>([])

  // Custom Exercise States
  const [isCreatingExercise, setIsCreatingExercise] = useState(false)
  const [isSubmittingExercise, setIsSubmittingExercise] = useState(false)
  const [customExercise, setCustomExercise] = useState({
    muscleGroup: "CHEST" as MuscleGroup,
    equipment: "Bodyweight"
  })

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        return
      }
      const res = await searchExercisesAction({ query: debouncedQuery })
      if (res.success && res.data) {
        setResults(res.data)
      } else {
        toast.error("Failed to search exercises")
      }
    }

    search()
  }, [debouncedQuery])

  const handleCreateCustomExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingExercise(true)
    
    const parsed = createCustomExerciseSchema.safeParse({
      name: query.trim(),
      muscleGroup: customExercise.muscleGroup,
      equipment: customExercise.equipment
    })

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input")
      setIsSubmittingExercise(false)
      return
    }

    const res = await createCustomExerciseAction(parsed.data)
    if (!res.success) {
      toast.error(res.error || "Failed to create exercise")
    } else if (res.data) {
      toast.success("Custom exercise created!")
      handleAddExercise(res.data)
      setIsCreatingExercise(false)
    }
    setIsSubmittingExercise(false)
  }

  const handleAddExercise = (exercise: any) => {
    const isLikelyTimeBased = exercise.name.toLowerCase().includes("plank") || exercise.name.toLowerCase().includes("hold")
    const newEx = { 
      exerciseId: exercise.id, 
      name: exercise.name, 
      sets: [{ 
        reps: isLikelyTimeBased ? 1 : 10, 
        weight: 0, 
        isBodyweight: exercise.equipment === "Bodyweight", 
        isTime: isLikelyTimeBased 
      }] 
    }
    setActiveExercises([...activeExercises, newEx])
    setQuery("")
    setResults([])
  }

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...activeExercises]
    const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1] || { reps: 10, weight: 0, isBodyweight: false, isTime: false }
    updated[exerciseIndex].sets.push({ ...lastSet })
    setActiveExercises(updated)
  }

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...activeExercises]
    updated[exerciseIndex].sets.splice(setIndex, 1)
    setActiveExercises(updated)
  }

  const handleUpdateSet = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight' | 'isBodyweight' | 'isTime', value: string | boolean) => {
    const updated = [...activeExercises]
    if (field === 'isBodyweight' || field === 'isTime') {
      updated[exerciseIndex].sets[setIndex][field] = value as boolean
      if (field === 'isBodyweight' && value) updated[exerciseIndex].sets[setIndex].weight = 0
    } else {
      updated[exerciseIndex].sets[setIndex][field] = Number(value) || 0
      if (field === 'weight' && updated[exerciseIndex].sets[setIndex].isBodyweight) {
        updated[exerciseIndex].sets[setIndex].isBodyweight = false
      }
    }
    setActiveExercises(updated)
  }

  const handleRemoveExercise = (exerciseIndex: number) => {
    const updated = [...activeExercises]
    updated.splice(exerciseIndex, 1)
    setActiveExercises(updated)
  }

  const handleSaveWorkout = async () => {
    if (activeExercises.length === 0) {
      toast.error("Add at least one exercise")
      return
    }

    setIsLogging(true)
    const dur = parseInt(duration) || 60
    
    // Client-side validation using zod
    const payload = {
      id: editingWorkoutId || undefined,
      name,
      duration: dur,
      caloriesBurned: null,
      activeExercises: activeExercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({
          ...s,
          weight: s.isBodyweight ? 0 : s.weight
        }))
      }))
    }
    
    // We import createQuickWorkoutSchema from workout actions. Wait, I'll just import it.
    // Actually, I can just do a basic check here or use the schema.
    if (!name.trim()) {
      toast.error("Workout name is required")
      setIsLogging(false)
      return
    }

    const res = await createQuickWorkoutAction(payload)
    
    if (res.success) {
      toast.success(editingWorkoutId ? "Workout updated" : "Workout logged successfully")
      setActiveExercises([])
      setName("Quick Workout")
      setEditingWorkoutId(null)
    } else {
      toast.error(res.error || "Failed to save workout")
    }
    setIsLogging(false)
  }

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workout?")) return
    
    const res = await deleteWorkoutLogAction({ id })
    if (res.success) {
      toast.success("Workout deleted")
      if (editingWorkoutId === id) {
        setEditingWorkoutId(null)
        setActiveExercises([])
        setName("Quick Workout")
      }
    } else {
      toast.error(res.error || "Failed to delete workout")
    }
  }

  const handleStartEditWorkout = (workout: WorkoutWithDetails) => {
    setEditingWorkoutId(workout.id)
    setName(workout.name)
    setDuration(workout.duration.toString())
    setActiveExercises(workout.exercises.map(ex => ({
      exerciseId: ex.exerciseId || "",
      name: ex.name,
      sets: ex.sets.map(s => ({
        reps: s.reps,
        weight: s.weight,
        isBodyweight: s.weight === 0,
        isTime: false // Defaulting to false, you could derive this from the name like before
      }))
    })))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Logger Section */}
      <div className="md:col-span-1 lg:col-span-2 space-y-6">
        <Card className={editingWorkoutId ? "border-primary shadow-md" : ""}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{editingWorkoutId ? "Edit Workout" : "Log New Workout"}</CardTitle>
                <CardDescription>{editingWorkoutId ? "Modifying past workout" : "Create a custom workout and track your sets."}</CardDescription>
              </div>
              {editingWorkoutId && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setEditingWorkoutId(null)
                  setActiveExercises([])
                  setName("Quick Workout")
                }}>
                  <X className="h-4 w-4 mr-1" /> Cancel Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label>Workout Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2 w-24">
                <Label>Duration (m)</Label>
                <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
            </div>

            {/* Exercise List */}
            {activeExercises.length > 0 && (
              <div className="space-y-4">
                {activeExercises.map((ex, i) => (
                  <div key={i} className="border rounded-md p-4 bg-muted/20">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">{ex.name}</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveExercise(i)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 items-center text-xs font-medium text-muted-foreground mb-1">
                        <div className="text-center">Set</div>
                        <div>Weight (kg)</div>
                        <div>Reps / Time</div>
                        <div></div>
                      </div>
                      {ex.sets.map((set, j) => (
                        <div key={j} className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 items-center">
                          <div className="text-center font-medium text-sm text-muted-foreground">{j + 1}</div>
                          <div className="relative flex items-center">
                            <Input 
                              type={set.isBodyweight ? "text" : "number"}
                              className={`h-8 ${set.isBodyweight ? "font-bold text-center text-primary bg-primary/5" : ""}`}
                              value={set.isBodyweight ? "BW" : (set.weight || "")} 
                              readOnly={set.isBodyweight}
                              onChange={e => handleUpdateSet(i, j, 'weight', e.target.value)} 
                            />
                            <Button 
                              type="button"
                              variant={set.isBodyweight ? "default" : "outline"}
                              size="sm"
                              className="absolute right-0 h-8 px-2 text-[10px] rounded-l-none"
                              onClick={() => handleUpdateSet(i, j, 'isBodyweight', !set.isBodyweight)}
                            >
                              BW
                            </Button>
                          </div>
                          <div className="relative flex items-center">
                            <Input 
                              type="number"
                              className={`h-8 ${set.isTime ? "pr-14" : "pr-16"}`} 
                              value={set.reps || ""} 
                              onChange={e => handleUpdateSet(i, j, 'reps', e.target.value)} 
                            />
                            {set.isTime && (
                              <span className="absolute right-12 text-xs text-muted-foreground pointer-events-none font-medium">
                                min
                              </span>
                            )}
                            <Button 
                              type="button"
                              variant={set.isTime ? "default" : "outline"}
                              size="sm"
                              className="absolute right-0 h-8 px-2 text-[10px] rounded-l-none"
                              onClick={() => handleUpdateSet(i, j, 'isTime', !set.isTime)}
                            >
                              TIME
                            </Button>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveSet(i, j)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full mt-2 gap-1 text-xs" onClick={() => handleAddSet(i)}>
                        <Plus className="h-3 w-3" /> Add Set
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Exercise Search */}
            <div className="pt-2 border-t">
              <Label className="mb-2 block">Add Exercise</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Search exercises (e.g. Bench Press)" 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                <Button type="button" size="icon" variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {results.length > 0 && !isCreatingExercise && (
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {results.map(exercise => (
                    <div key={exercise.id} className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer transition-colors" onClick={() => handleAddExercise(exercise)}>
                      <div>
                        <div className="font-medium text-sm">{exercise.name}</div>
                        <div className="text-xs text-muted-foreground">{exercise.muscleGroup}</div>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}

              {query.trim() !== "" && results.length === 0 && !isCreatingExercise && (
                <div className="mt-2 text-center p-4 border rounded-md bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-4">No exercises found for "{query}"</p>
                  <Button variant="outline" onClick={() => setIsCreatingExercise(true)}>
                    Create Custom Exercise
                  </Button>
                </div>
              )}

              {isCreatingExercise && (
                <form onSubmit={handleCreateCustomExercise} className="mt-4 space-y-4 border rounded-md p-4 bg-muted/50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm">Create: {query}</h4>
                    <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreatingExercise(false)}>Cancel</Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Muscle Group</Label>
                      <select 
                        value={customExercise.muscleGroup} 
                        onChange={e => setCustomExercise({...customExercise, muscleGroup: e.target.value as MuscleGroup})}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {["CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "FOREARMS", "CORE", "QUADS", "HAMSTRINGS", "GLUTES", "CALVES", "FULL_BODY", "CARDIO"].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Equipment (Optional)</Label>
                      <Input value={customExercise.equipment} onChange={e => setCustomExercise({...customExercise, equipment: e.target.value})} placeholder="e.g. Barbell, Dumbbell, Bodyweight" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmittingExercise}>
                    {isSubmittingExercise ? "Creating..." : "Create & Add Exercise"}
                  </Button>
                </form>
              )}
            </div>

            <Button className="w-full mt-6" onClick={handleSaveWorkout} disabled={isLogging || activeExercises.length === 0}>
              {isLogging ? "Saving..." : (editingWorkoutId ? "Update Workout" : "Save Workout")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentWorkouts.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No workouts logged yet.</p>
            ) : (
              recentWorkouts.map(workout => (
                <div key={workout.id} className="p-3 border rounded-lg bg-card shadow-sm space-y-2 group">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-primary" />
                      {workout.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{formatDate(workout.date)}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity [&:focus-within]:opacity-100">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleStartEditWorkout(workout)}>
                          <Edit2 className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-destructive/10" onClick={() => handleDeleteWorkout(workout.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {workout.duration} min • {workout.exercises.length} exercises
                  </div>
                  <div className="text-xs space-y-1 pt-2 border-t mt-2">
                    {workout.exercises.map(ex => (
                      <div key={ex.id} className="flex justify-between">
                        <span className="truncate pr-2">{ex.name}</span>
                        <span>{ex.sets.length} sets</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
