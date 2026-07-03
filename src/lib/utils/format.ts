const numberFormatter = new Intl.NumberFormat('en-US')

export function formatNumber(n: number, decimals?: number): string {
  if (decimals !== undefined) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n)
  }
  return numberFormatter.format(n)
}

export function kgToLbs(kg: number): number {
  return kg * 2.20462
}

export function lbsToKg(lbs: number): number {
  return lbs / 2.20462
}

export function formatWeight(kg: number, unit: 'kg' | 'lbs' = 'kg'): string {
  if (unit === 'lbs') {
    return `${formatNumber(kgToLbs(kg), 1)} lbs`
  }
  return `${formatNumber(kg, 1)} kg`
}

export function formatCalories(cal: number): string {
  return `${formatNumber(Math.round(cal))} kcal`
}

export function formatMacro(grams: number): string {
  return `${Math.round(grams)}g`
}

export function formatWater(ml: number): string {
  if (ml >= 1000) {
    return `${formatNumber(ml / 1000, 1)}L`
  }
  return `${Math.round(ml)}ml`
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)

  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
  if (hours > 0) return `${hours}h`
  return `${mins}m`
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}
