import 'dotenv/config'
import { PrismaClient, MuscleGroup, Difficulty } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // --- Exercises ---
  const exercises = [
    // Chest
    { name: 'Barbell Bench Press', muscleGroup: MuscleGroup.CHEST, equipment: 'Barbell', difficulty: Difficulty.INTERMEDIATE, homeSupported: false, gymSupported: true, instructions: 'Lie on a flat bench and press the barbell up.' },
    { name: 'Dumbbell Bench Press', muscleGroup: MuscleGroup.CHEST, equipment: 'Dumbbells', difficulty: Difficulty.BEGINNER, homeSupported: true, gymSupported: true, instructions: 'Lie on a flat bench and press dumbbells up.' },
    { name: 'Push-up', muscleGroup: MuscleGroup.CHEST, equipment: 'Bodyweight', difficulty: Difficulty.BEGINNER, homeSupported: true, gymSupported: true, instructions: 'Lower your body until your chest is near the floor, then push back up.' },
    { name: 'Incline Barbell Bench Press', muscleGroup: MuscleGroup.CHEST, equipment: 'Barbell', difficulty: Difficulty.INTERMEDIATE, homeSupported: false, gymSupported: true, instructions: 'Press barbell on an incline bench.' },
    
    // Back
    { name: 'Pull-up', muscleGroup: MuscleGroup.BACK, equipment: 'Bodyweight', difficulty: Difficulty.INTERMEDIATE, homeSupported: true, gymSupported: true, instructions: 'Pull yourself up to the bar.' },
    { name: 'Barbell Row', muscleGroup: MuscleGroup.BACK, equipment: 'Barbell', difficulty: Difficulty.INTERMEDIATE, homeSupported: false, gymSupported: true, instructions: 'Bend over and pull the barbell to your lower chest.' },
    { name: 'Lat Pulldown', muscleGroup: MuscleGroup.BACK, equipment: 'Machine', difficulty: Difficulty.BEGINNER, homeSupported: false, gymSupported: true, instructions: 'Pull the bar down to your chest.' },
    { name: 'Dumbbell Row', muscleGroup: MuscleGroup.BACK, equipment: 'Dumbbell', difficulty: Difficulty.BEGINNER, homeSupported: true, gymSupported: true, instructions: 'Pull the dumbbell up to your torso while supporting yourself.' },
    
    // Shoulders
    { name: 'Overhead Press', muscleGroup: MuscleGroup.SHOULDERS, equipment: 'Barbell', difficulty: Difficulty.INTERMEDIATE, homeSupported: false, gymSupported: true, instructions: 'Press the barbell overhead from your shoulders.' },
    { name: 'Lateral Raise', muscleGroup: MuscleGroup.SHOULDERS, equipment: 'Dumbbells', difficulty: Difficulty.BEGINNER, homeSupported: true, gymSupported: true, instructions: 'Raise dumbbells to the sides.' },
    { name: 'Front Raise', muscleGroup: MuscleGroup.SHOULDERS, equipment: 'Dumbbells', difficulty: Difficulty.BEGINNER, homeSupported: true, gymSupported: true, instructions: 'Raise dumbbells to the front.' },
    
    // Biceps
    { name: 'Barbell Curl', muscleGroup: MuscleGroup.BICEPS, equipment: 'Barbell', difficulty: Difficulty.BEGINNER, homeSupported: false, gymSupported: true, instructions: 'Curl the barbell up.' },
    { name: 'Dumbbell Curl', muscleGroup: MuscleGroup.BICEPS, equipment: 'Dumbbells', difficulty: Difficulty.BEGINNER, homeSupported: true, gymSupported: true, instructions: 'Curl the dumbbells up.' },
    { name: 'Hammer Curl', muscleGroup: MuscleGroup.BICEPS, equipment: 'Dumbbells', difficulty: Difficulty.BEGINNER, homeSupported: true, gymSupported: true, instructions: 'Curl dumbbells with a neutral grip.' },
    
    // Triceps
    { name: 'Tricep Pushdown', muscleGroup: MuscleGroup.TRICEPS, equipment: 'Cable', difficulty: Difficulty.BEGINNER, homeSupported: false, gymSupported: true, instructions: 'Push the cable attachment down.' },
    { name: 'Overhead Tricep Extension', muscleGroup: MuscleGroup.TRICEPS, equipment: 'Dumbbell', difficulty: Difficulty.BEGINNER, homeSupported: true, gymSupported: true, instructions: 'Extend dumbbell overhead.' },
    { name: 'Dips', muscleGroup: MuscleGroup.TRICEPS, equipment: 'Bodyweight', difficulty: Difficulty.INTERMEDIATE, homeSupported: true, gymSupported: true, instructions: 'Lower your body on parallel bars.' },
    
    // Quads
    { name: 'Barbell Squat', muscleGroup: MuscleGroup.QUADS, equipment: 'Barbell', difficulty: Difficulty.INTERMEDIATE, homeSupported: false, gymSupported: true, instructions: 'Squat down with barbell on your back.' },
    { name: 'Leg Press', muscleGroup: MuscleGroup.QUADS, equipment: 'Machine', difficulty: Difficulty.BEGINNER, homeSupported: false, gymSupported: true, instructions: 'Press the sled away with your feet.' },
    { name: 'Bulgarian Split Squat', muscleGroup: MuscleGroup.QUADS, equipment: 'Dumbbells', difficulty: Difficulty.ADVANCED, homeSupported: true, gymSupported: true, instructions: 'Squat with one foot elevated behind you.' },
    { name: 'Bodyweight Squat', muscleGroup: MuscleGroup.QUADS, equipment: 'Bodyweight', difficulty: Difficulty.BEGINNER, homeSupported: true, gymSupported: true, instructions: 'Squat down using your bodyweight.' },
    
    // Hamstrings
    { name: 'Romanian Deadlift', muscleGroup: MuscleGroup.HAMSTRINGS, equipment: 'Barbell', difficulty: Difficulty.INTERMEDIATE, homeSupported: false, gymSupported: true, instructions: 'Hinge at the hips with slightly bent knees.' },
    { name: 'Leg Curl', muscleGroup: MuscleGroup.HAMSTRINGS, equipment: 'Machine', difficulty: Difficulty.BEGINNER, homeSupported: false, gymSupported: true, instructions: 'Curl your legs backward against resistance.' },
    
    // Glutes
    { name: 'Barbell Hip Thrust', muscleGroup: MuscleGroup.GLUTES, equipment: 'Barbell', difficulty: Difficulty.INTERMEDIATE, homeSupported: false, gymSupported: true, instructions: 'Thrust your hips up with barbell across your lap.' },
    { name: 'Glute Bridge', muscleGroup: MuscleGroup.GLUTES, equipment: 'Bodyweight', difficulty: Difficulty.BEGINNER, homeSupported: true, gymSupported: true, instructions: 'Raise hips off the floor.' },
    
    // Calves
    { name: 'Standing Calf Raise', muscleGroup: MuscleGroup.CALVES, equipment: 'Machine', difficulty: Difficulty.BEGINNER, homeSupported: false, gymSupported: true, instructions: 'Raise up on your toes.' },
    { name: 'Seated Calf Raise', muscleGroup: MuscleGroup.CALVES, equipment: 'Machine', difficulty: Difficulty.BEGINNER, homeSupported: false, gymSupported: true, instructions: 'Raise heels while seated.' },
    
    // Core
    { name: 'Plank', muscleGroup: MuscleGroup.CORE, equipment: 'Bodyweight', difficulty: Difficulty.BEGINNER, homeSupported: true, gymSupported: true, instructions: 'Hold a push-up position on your elbows.' },
    { name: 'Crunch', muscleGroup: MuscleGroup.CORE, equipment: 'Bodyweight', difficulty: Difficulty.BEGINNER, homeSupported: true, gymSupported: true, instructions: 'Curl your upper torso off the floor.' },
    { name: 'Hanging Leg Raise', muscleGroup: MuscleGroup.CORE, equipment: 'Bodyweight', difficulty: Difficulty.INTERMEDIATE, homeSupported: true, gymSupported: true, instructions: 'Hang from a bar and raise your legs.' },
    { name: 'Russian Twist', muscleGroup: MuscleGroup.CORE, equipment: 'Bodyweight', difficulty: Difficulty.BEGINNER, homeSupported: true, gymSupported: true, instructions: 'Twist torso side to side while seated.' },

    // Full Body
    { name: 'Deadlift', muscleGroup: MuscleGroup.FULL_BODY, equipment: 'Barbell', difficulty: Difficulty.ADVANCED, homeSupported: false, gymSupported: true, instructions: 'Lift barbell from the floor by extending hips and knees.' },
    { name: 'Burpee', muscleGroup: MuscleGroup.FULL_BODY, equipment: 'Bodyweight', difficulty: Difficulty.INTERMEDIATE, homeSupported: true, gymSupported: true, instructions: 'Drop to floor, push-up, jump up.' },
    
    // Cardio
    { name: 'Treadmill Running', muscleGroup: MuscleGroup.CARDIO, equipment: 'Machine', difficulty: Difficulty.BEGINNER, homeSupported: false, gymSupported: true, instructions: 'Run on the treadmill.' },
    { name: 'Rowing Machine', muscleGroup: MuscleGroup.CARDIO, equipment: 'Machine', difficulty: Difficulty.INTERMEDIATE, homeSupported: false, gymSupported: true, instructions: 'Row using the ergometer.' },
    { name: 'Cycling', muscleGroup: MuscleGroup.CARDIO, equipment: 'Machine', difficulty: Difficulty.BEGINNER, homeSupported: false, gymSupported: true, instructions: 'Ride the stationary bike.' },
    { name: 'Jump Rope', muscleGroup: MuscleGroup.CARDIO, equipment: 'Bodyweight', difficulty: Difficulty.BEGINNER, homeSupported: true, gymSupported: true, instructions: 'Skip rope.' }
  ]

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: ex,
    })
  }

  // --- Foods ---
  const foods = [
    // Proteins
    { name: 'Chicken Breast, cooked', servingSize: '100g', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: 'Egg, large', servingSize: '1 large', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8 },
    { name: 'Boiled Egg, large', servingSize: '1 large', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
    { name: 'Salmon, cooked', servingSize: '100g', calories: 206, protein: 22, carbs: 0, fat: 12 },
    { name: 'Greek Yogurt, nonfat', servingSize: '1 cup', calories: 100, protein: 17, carbs: 6, fat: 0 },
    { name: 'Tofu, firm', servingSize: '100g', calories: 144, protein: 15, carbs: 2.8, fat: 8.7 },
    { name: 'Canned Tuna, in water', servingSize: '1 can (165g)', calories: 130, protein: 29, carbs: 0, fat: 0.5 },
    { name: 'Whey Protein Powder', servingSize: '1 scoop (30g)', calories: 120, protein: 24, carbs: 3, fat: 1.5 },
    
    // Carbs
    { name: 'White Rice, cooked', servingSize: '1 cup', calories: 205, protein: 4.3, carbs: 44.5, fat: 0.4 },
    { name: 'Brown Rice, cooked', servingSize: '1 cup', calories: 216, protein: 5, carbs: 45, fat: 1.8 },
    { name: 'Oats, rolled', servingSize: '1/2 cup dry', calories: 150, protein: 5, carbs: 27, fat: 2.5 },
    { name: 'Sweet Potato, cooked', servingSize: '1 medium', calories: 103, protein: 2, carbs: 24, fat: 0.2 },
    { name: 'Banana', servingSize: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
    { name: 'Whole Wheat Bread', servingSize: '1 slice', calories: 69, protein: 3.6, carbs: 11.6, fat: 0.9 },
    { name: 'White Bread', servingSize: '1 slice', calories: 75, protein: 2.5, carbs: 14, fat: 1 },
    { name: 'Pasta, cooked', servingSize: '1 cup', calories: 220, protein: 8, carbs: 43, fat: 1.3 },
    { name: 'Apple', servingSize: '1 medium', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
    { name: 'Potato, baked', servingSize: '1 medium', calories: 161, protein: 4.3, carbs: 36.6, fat: 0.2 },

    // Fats
    { name: 'Almonds', servingSize: '1 oz (28g)', calories: 164, protein: 6, carbs: 6, fat: 14 },
    { name: 'Avocado', servingSize: '1/2 medium', calories: 160, protein: 2, carbs: 9, fat: 15 },
    { name: 'Olive Oil', servingSize: '1 tbsp', calories: 119, protein: 0, carbs: 0, fat: 13.5 },
    { name: 'Peanut Butter', servingSize: '2 tbsp', calories: 188, protein: 8, carbs: 6, fat: 16 },
    { name: 'Butter', servingSize: '1 tbsp', calories: 102, protein: 0.1, carbs: 0, fat: 11.5 },
    { name: 'Cheddar Cheese', servingSize: '1 oz (28g)', calories: 113, protein: 7, carbs: 0.4, fat: 9 },

    // Veggies/Others
    { name: 'Broccoli, cooked', servingSize: '1 cup', calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6 },
    { name: 'Spinach, raw', servingSize: '1 cup', calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1 },
    { name: 'Carrots, raw', servingSize: '1 medium', calories: 25, protein: 0.6, carbs: 5.8, fat: 0.1 },
    { name: 'Milk, whole', servingSize: '1 cup', calories: 149, protein: 7.7, carbs: 11.7, fat: 8 },
    { name: 'Milk, 1%', servingSize: '1 cup', calories: 102, protein: 8, carbs: 12, fat: 2.4 }
  ]

  for (const food of foods) {
    await prisma.food.upsert({
      where: { name: food.name },
      update: {},
      create: food,
    })
  }

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
