import type { Role } from "./permissions"

export interface UserProfile {
  id: string
  full_name: string
  role: Role
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UserWithProfile {
  id: string
  email: string
  profile: UserProfile
}
