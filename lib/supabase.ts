import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please check your .env.local file.")
  console.error("Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration is missing. Please check your environment variables.")
  }
  return createClientComponentClient()
}

export const createServerClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration is missing. Please check your environment variables.")
  }
  return createServerComponentClient({ cookies })
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: "student" | "instructor" | "admin"
          bio: string | null
          avatar_url: string | null
          language: string
          region: string
          notification_settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role?: "student" | "instructor" | "admin"
          bio?: string | null
          avatar_url?: string | null
          language?: string
          region?: string
          notification_settings?: any
        }
        Update: {
          email?: string
          first_name?: string
          last_name?: string
          role?: "student" | "instructor" | "admin"
          bio?: string | null
          avatar_url?: string | null
          language?: string
          region?: string
          notification_settings?: any
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          color: string
          enrollment_code: string
          allow_enrollment: boolean
          is_archived: boolean
          instructor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          code: string
          description?: string | null
          color?: string
          enrollment_code?: string
          allow_enrollment?: boolean
          is_archived?: boolean
          instructor_id: string
        }
        Update: {
          name?: string
          code?: string
          description?: string | null
          color?: string
          enrollment_code?: string
          allow_enrollment?: boolean
          is_archived?: boolean
        }
      }
    }
    Functions: {
      get_user_courses: {
        Args: { user_id: string }
        Returns: {
          id: string
          name: string
          code: string
          description: string
          color: string
          instructor_name: string
          student_count: number
          is_instructor: boolean
        }[]
      }
      get_student_performance: {
        Args: { student_id: string }
        Returns: {
          total_assignments: number
          completed_assignments: number
          average_grade: number
          on_time_submissions: number
          late_submissions: number
          missed_assignments: number
        }[]
      }
      get_instructor_stats: {
        Args: { instructor_id: string }
        Returns: {
          total_courses: number
          total_students: number
          total_assignments: number
          total_resources: number
          average_student_grade: number
        }[]
      }
    }
  }
}
