export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' }
  if (bmi < 25) return { label: 'Normal', color: 'text-green-500' }
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-500' }
  return { label: 'Obese', color: 'text-red-500' }
}
