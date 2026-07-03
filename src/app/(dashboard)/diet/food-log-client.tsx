"use client"

import { useState, useEffect } from "react"
import type { FoodEntry } from "@prisma/client"
const MealType = {
  BREAKFAST: "BREAKFAST",
  LUNCH: "LUNCH",
  DINNER: "DINNER",
  SNACK: "SNACK"
} as const;
type MealType = typeof MealType[keyof typeof MealType];
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Trash2, Edit2, Check, X } from "lucide-react"
import { searchFoodsAction, logFoodAction, createCustomFoodAction, deleteFoodEntryAction, updateFoodEntryAction } from "@/actions/diet"
import { logFoodSchema, createCustomFoodSchema, updateFoodEntrySchema } from "@/lib/validations/schemas"
import { toast } from "sonner"
import { MEAL_TYPES } from "@/constants/app"
import { useDebounce } from "@/hooks/use-debounce"

interface FoodLogClientProps {
  entries: FoodEntry[]
}

export function FoodLogClient({ entries }: FoodLogClientProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const [results, setResults] = useState<any[]>([])
  const [selectedMeal, setSelectedMeal] = useState<MealType>("BREAKFAST")
  const [servings, setServings] = useState("1")

  // Edit States
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editServings, setEditServings] = useState("1")
  const [editMealType, setEditMealType] = useState<MealType>("BREAKFAST")
  const [isUpdating, setIsUpdating] = useState(false)

  // Custom Food States
  const [isCreatingFood, setIsCreatingFood] = useState(false)
  const [isSubmittingFood, setIsSubmittingFood] = useState(false)
  const [customFood, setCustomFood] = useState({
    servingSize: "100g",
    calories: "",
    protein: "",
    carbs: "",
    fat: ""
  })

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        return
      }
      setIsSearching(true)
      const res = await searchFoodsAction({ query: debouncedQuery })
      if (res.success && res.data) {
        setResults(res.data)
      } else {
        toast.error("Failed to search foods")
      }
      setIsSearching(false)
    }

    search()
    setServings("1")
  }, [debouncedQuery])

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this food entry?")) return
    
    const res = await deleteFoodEntryAction({ id })
    if (res.success) {
      toast.success("Entry deleted")
    } else {
      toast.error(res.error || "Failed to delete entry")
    }
  }

  const handleStartEdit = (entry: FoodEntry) => {
    setEditingEntryId(entry.id)
    setEditServings(entry.servings.toString())
    setEditMealType(entry.mealType)
  }

  const handleSaveEdit = async () => {
    if (!editingEntryId) return
    
    const parsed = updateFoodEntrySchema.safeParse({
      id: editingEntryId,
      servings: Number(editServings),
      mealType: editMealType
    })

    if (!parsed.success) {
      toast.error("Invalid input")
      return
    }

    setIsUpdating(true)
    const res = await updateFoodEntryAction(parsed.data)
    if (res.success) {
      toast.success("Entry updated")
      setEditingEntryId(null)
    } else {
      toast.error(res.error || "Failed to update entry")
    }
    setIsUpdating(false)
  }

  const handleCreateCustomFood = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingFood(true)
    
    const parsed = createCustomFoodSchema.safeParse({
      name: query.trim(),
      servingSize: customFood.servingSize,
      calories: parseInt(customFood.calories),
      protein: parseFloat(customFood.protein),
      carbs: parseFloat(customFood.carbs),
      fat: parseFloat(customFood.fat)
    })

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input")
      setIsSubmittingFood(false)
      return
    }

    const res = await createCustomFoodAction(parsed.data)
    if (!res.success) {
      toast.error(res.error || "Failed to create food")
    } else if (res.data) {
      toast.success("Custom food created!")
      // Automatically log it
      await handleLogFood(res.data.id)
      setIsCreatingFood(false)
    }
    setIsSubmittingFood(false)
  }

  const handleLogFood = async (foodId: string) => {
    const s = parseFloat(servings)
    const parsed = logFoodSchema.safeParse({ foodId, mealType: selectedMeal, servings: s })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input")
      return
    }
    
    const res = await logFoodAction(parsed.data)
    if (res.success) {
      toast.success("Food logged successfully")
      setQuery("")
      setResults([])
    } else {
      toast.error(res.error || "Failed to log food")
    }
  }

  const mealGroups = MEAL_TYPES.map(meal => ({
    name: meal,
    entries: entries.filter(e => e.mealType === meal)
  }))

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Log Food</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Search food (e.g. Chicken breast)" 
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <Button type="button" disabled={isSearching} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {results.length > 0 && !isCreatingFood && (
              <div className="space-y-4 border rounded-md p-4 bg-muted/50">
                <div className="flex gap-4 items-end">
                  <div className="space-y-2 flex-1">
                    <Label>Meal</Label>
                    <select 
                      value={selectedMeal} 
                      onChange={e => setSelectedMeal(e.target.value as MealType)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {MEAL_TYPES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 w-24">
                    <Label>Servings</Label>
                    <Input type="number" step="0.5" min="0.5" value={servings} onChange={e => setServings(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {results.map(food => (
                    <div key={food.id} className="flex items-center justify-between p-2 border rounded bg-background">
                      <div>
                        <div className="font-medium text-sm">{food.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {food.calories} kcal • {food.protein}g P • {food.carbs}g C • {food.fat}g F ({food.servingSize})
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleLogFood(food.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isSearching && query.trim() !== "" && results.length === 0 && !isCreatingFood && (
              <div className="text-center p-4 border rounded-md bg-muted/20">
                <p className="text-sm text-muted-foreground mb-4">No foods found for "{query}"</p>
                <Button variant="outline" onClick={() => setIsCreatingFood(true)}>
                  Create Custom Food
                </Button>
              </div>
            )}

            {isCreatingFood && (
              <form onSubmit={handleCreateCustomFood} className="space-y-4 border rounded-md p-4 bg-muted/50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-sm">Create: {query}</h4>
                  <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreatingFood(false)}>Cancel</Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Serving Size (e.g. 100g, 1 cup)</Label>
                    <Input required value={customFood.servingSize} onChange={e => setCustomFood({...customFood, servingSize: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Calories (kcal)</Label>
                    <Input required type="number" min="0" value={customFood.calories} onChange={e => setCustomFood({...customFood, calories: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Protein (g)</Label>
                    <Input required type="number" step="0.1" min="0" value={customFood.protein} onChange={e => setCustomFood({...customFood, protein: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Carbs (g)</Label>
                    <Input required type="number" step="0.1" min="0" value={customFood.carbs} onChange={e => setCustomFood({...customFood, carbs: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fat (g)</Label>
                    <Input required type="number" step="0.1" min="0" value={customFood.fat} onChange={e => setCustomFood({...customFood, fat: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Meal to Log To</Label>
                    <select 
                      value={selectedMeal} 
                      onChange={e => setSelectedMeal(e.target.value as MealType)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {MEAL_TYPES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmittingFood}>
                  {isSubmittingFood ? "Creating..." : "Create & Log Food"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Meals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {mealGroups.map(group => (
              <div key={group.name} className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center justify-between">
                  <span>{group.name}</span>
                  <span className="text-muted-foreground text-xs font-normal">
                    {group.entries.reduce((sum, e) => sum + e.calories, 0)} kcal
                  </span>
                </h3>
                {group.entries.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No entries yet.</p>
                ) : (
                  <div className="space-y-1">
                    {group.entries.map(entry => (
                      <div key={entry.id} className="flex flex-col p-2 rounded hover:bg-muted/50 transition-colors group">
                        {editingEntryId === entry.id ? (
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{entry.name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-[10px]">Servings</Label>
                                <Input type="number" step="0.5" className="h-7 text-xs" value={editServings} onChange={e => setEditServings(e.target.value)} />
                              </div>
                              <div>
                                <Label className="text-[10px]">Meal</Label>
                                <select 
                                  value={editMealType} 
                                  onChange={e => setEditMealType(e.target.value as MealType)}
                                  className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                >
                                  {MEAL_TYPES.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-1">
                              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setEditingEntryId(null)}>
                                <X className="h-3 w-3 mr-1" /> Cancel
                              </Button>
                              <Button size="sm" className="h-6 px-2 text-xs" onClick={handleSaveEdit} disabled={isUpdating}>
                                <Check className="h-3 w-3 mr-1" /> Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center w-full">
                            <div>
                              <span className="text-sm">{entry.name}</span>
                              <span className="text-muted-foreground ml-2 text-xs">x{entry.servings}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-xs">{entry.calories} kcal</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity [&:focus-within]:opacity-100">
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleStartEdit(entry as any)}>
                                  <Edit2 className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-destructive/10" onClick={() => handleDeleteEntry(entry.id)}>
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
