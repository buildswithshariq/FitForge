import { prisma } from "@/lib/db/prisma"
import { Profile, Prisma } from "@prisma/client"

export class ProfileRepository {
  async getProfileByUserId(userId: string): Promise<Profile | null> {
    return prisma.profile.findUnique({
      where: { userId },
    })
  }

  async createProfile(data: Prisma.ProfileUncheckedCreateInput): Promise<Profile> {
    return prisma.profile.create({
      data,
    })
  }

  async updateProfile(userId: string, data: Prisma.ProfileUncheckedUpdateInput): Promise<Profile> {
    return prisma.profile.update({
      where: { userId },
      data,
    })
  }
}

export const profileRepository = new ProfileRepository()
