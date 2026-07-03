import { profileRepository } from "@/repositories/profile.repository"
import { calculateBMR } from "@/lib/calculators/bmr"
import { calculateTDEE } from "@/lib/calculators/tdee"
import { calculateMacros } from "@/lib/calculators/macros"
import { Gender, Goal, ActivityLevel, Profile } from "@prisma/client"

export interface SetupProfileDTO {
  userId: string
  age: number
  gender: Gender
  height: number // cm
  currentWeight: number // kg
  targetWeight: number // kg
  goal: Goal
  activityLevel: ActivityLevel
}

export class ProfileService {
  async setupProfile(dto: SetupProfileDTO): Promise<Profile> {
    // 1. Check if profile already exists
    const existing = await profileRepository.getProfileByUserId(dto.userId)
    if (existing) {
      throw new Error("Profile already exists")
    }

    // 2. Run calculations (pure functions)
    const bmr = calculateBMR(dto.currentWeight, dto.height, dto.age, dto.gender)
    const tdee = calculateTDEE(bmr, dto.activityLevel)
    const macros = calculateMacros(tdee, dto.goal)

    // 3. Save to database
    return profileRepository.createProfile({
      userId: dto.userId,
      age: dto.age,
      gender: dto.gender,
      height: dto.height,
      currentWeight: dto.currentWeight,
      targetWeight: dto.targetWeight,
      goal: dto.goal,
      activityLevel: dto.activityLevel,
      bmr,
      tdee,
      targetCalories: macros.calories,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFat: macros.fat,
    })
  }

  async getProfile(userId: string): Promise<Profile | null> {
    return profileRepository.getProfileByUserId(userId)
  }

  async updateProfile(userId: string, dto: Omit<SetupProfileDTO, 'userId'>): Promise<Profile> {
    const existing = await profileRepository.getProfileByUserId(userId)
    if (!existing) {
      throw new Error("Profile not found")
    }

    const bmr = calculateBMR(dto.currentWeight, dto.height, dto.age, dto.gender)
    const tdee = calculateTDEE(bmr, dto.activityLevel)
    const macros = calculateMacros(tdee, dto.goal)

    return profileRepository.updateProfile(userId, {
      age: dto.age,
      gender: dto.gender,
      height: dto.height,
      currentWeight: dto.currentWeight,
      targetWeight: dto.targetWeight,
      goal: dto.goal,
      activityLevel: dto.activityLevel,
      bmr,
      tdee,
      targetCalories: macros.calories,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFat: macros.fat,
    })
  }
}

export const profileService = new ProfileService()
