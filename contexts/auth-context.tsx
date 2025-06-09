"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/auth-helpers-nextjs"

interface AuthContextType {
  user: User | null
  profile: any | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ data?: any; error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        const client = createClient()
        setSupabase(client)
        setError(null)

        const getSession = async () => {
          const {
            data: { session },
          } = await client.auth.getSession()
          setUser(session?.user ?? null)

          if (session?.user) {
            const { data: profile } = await client.from("profiles").select("*").eq("id", session.user.id).single()
            setProfile(profile)
          }

          setLoading(false)
        }

        await getSession()

        const {
          data: { subscription },
        } = client.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state change:", event)
          setUser(session?.user ?? null)

          if (session?.user) {
            const { data: profile } = await client.from("profiles").select("*").eq("id", session.user.id).single()
            setProfile(profile)
          } else {
            setProfile(null)
          }

          setLoading(false)
        })

        return () => subscription.unsubscribe()
      } catch (err) {
        console.error("Failed to initialize Supabase:", err)
        setError("Failed to initialize authentication. Please check your configuration.")
        setLoading(false)
      }
    }

    initializeSupabase()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: "Authentication service not available" } }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    if (!supabase) {
      return { error: { message: "Authentication service not available" } }
    }

    try {
      // First check if the user already exists
      const { data: existingUsers } = await supabase.from("profiles").select("email").eq("email", email).limit(1)

      if (existingUsers && existingUsers.length > 0) {
        return { error: { message: "A user with this email already exists" } }
      }

      // Proceed with signup - let the database trigger handle profile creation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role,
            email: email, // Explicitly include email in user metadata
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Signup error:", error)
        return { error }
      }

      // Don't try to manually create the profile - rely on the database trigger
      console.log("Signup successful:", data)
      return { data, error: null }
    } catch (err) {
      console.error("Unexpected signup error:", err)
      return { error: { message: "An unexpected error occurred during signup" } }
    }
  }

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: { message: "Authentication service not available" } }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error }
  }

  // Show error state if Supabase failed to initialize
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Configuration Error</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-4">
              <p className="text-xs text-gray-400">
                Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
                are set.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
