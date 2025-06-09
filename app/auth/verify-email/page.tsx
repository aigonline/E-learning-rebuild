"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, BookOpen, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [devSignupSuccess, setDevSignupSuccess] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Initialize data from localStorage only once
  useEffect(() => {
    if (initialized) return

    const hasDevSuccess = localStorage.getItem("devSignupSuccess") === "true"
    setDevSignupSuccess(hasDevSuccess)

    const pendingEmail = localStorage.getItem("pendingVerificationEmail")
    if (pendingEmail) {
      setUserEmail(pendingEmail)
    }

    const storedUserData = localStorage.getItem("pendingUserData")
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData))
      } catch (e) {
        console.error("Failed to parse user data", e)
      }
    }

    setInitialized(true)
  }, [initialized])

  // Handle successful verification
  const handleVerificationSuccess = useCallback(
    (email?: string) => {
      setIsVerified(true)
      localStorage.removeItem("pendingVerificationEmail")
      localStorage.removeItem("devSignupSuccess")
      localStorage.removeItem("pendingUserData")

      toast({
        title: "Email verified successfully!",
        description: "Welcome to Virtual Campus!",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    },
    [router, toast],
  )

  // Check URL parameters for verification tokens
  useEffect(() => {
    if (!initialized) return

    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")
    const type = searchParams.get("type")

    if (accessToken && refreshToken && type === "signup") {
      const setSession = async () => {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            setError(`Verification failed: ${error.message}`)
          } else if (data.user) {
            setUserEmail(data.user.email || null)
            handleVerificationSuccess(data.user.email || undefined)
          }
        } catch (err) {
          setError("An unexpected error occurred during verification")
        }
      }

      setSession()
    }
  }, [initialized, searchParams, supabase, handleVerificationSuccess])

  // Check current session
  useEffect(() => {
    if (!initialized) return

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (process.env.NODE_ENV !== "production") {
          setDebugInfo({
            hasSession: !!session,
            sessionError: sessionError?.message,
            userId: session?.user?.id,
            userEmail: session?.user?.email,
            emailConfirmed: session?.user?.email_confirmed_at,
            pendingEmail: userEmail,
          })
        }

        if (session?.user?.email) {
          setUserEmail(session.user.email)

          if (session.user.email_confirmed_at) {
            handleVerificationSuccess(session.user.email)
            return
          }
        }

        // Try to get user from auth if no session
        if (!session) {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser()

          if (user?.email) {
            setUserEmail(user.email)
            if (user.email_confirmed_at) {
              handleVerificationSuccess(user.email)
            }
          }
        }
      } catch (err) {
        console.error("Session check error:", err)
        setError("An unexpected error occurred while checking verification status")
      }
    }

    checkSession()
  }, [initialized, supabase, handleVerificationSuccess, userEmail])

  // Listen for auth state changes
  useEffect(() => {
    if (!initialized) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email_confirmed_at)

      if (event === "SIGNED_IN" && session?.user) {
        setUserEmail(session.user.email || null)

        if (session.user.email_confirmed_at) {
          handleVerificationSuccess(session.user.email || undefined)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initialized, supabase, handleVerificationSuccess])

  const resendVerification = async () => {
    if (!userEmail) {
      setError("No email address found. Please try signing up again.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      toast({
        title: "Verification email sent!",
        description: `Please check your email at ${userEmail}`,
      })
    } catch (err) {
      setError("Failed to resend verification email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUpAgain = () => {
    localStorage.removeItem("pendingVerificationEmail")
    localStorage.removeItem("devSignupSuccess")
    localStorage.removeItem("pendingUserData")
    router.push("/auth/signup")
  }

  const handleDevDirectLogin = () => {
    localStorage.removeItem("pendingVerificationEmail")
    localStorage.removeItem("devSignupSuccess")
    localStorage.removeItem("pendingUserData")
    router.push("/auth/login")
  }

  // Show loading state while initializing
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Virtual Campus</span>
            </div>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Email Verified!</CardTitle>
            <CardDescription>Your email has been successfully verified. Redirecting to dashboard...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Virtual Campus</span>
          </div>
          <div className="flex justify-center mb-4">
            <Mail className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            {userEmail ? (
              <>
                We've sent a verification link to <strong>{userEmail}</strong>. Please check your inbox and click the
                link to verify your account.
              </>
            ) : (
              "Please check your email for a verification link to activate your account."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription>
              If you don't see the email in your inbox, please check your spam folder.
            </AlertDescription>
          </Alert>

          {/* Development notice for signup success */}
          {process.env.NODE_ENV !== "production" && devSignupSuccess && (
            <Alert>
              <AlertDescription className="text-green-600">
                <strong>Development Mode:</strong> Account created successfully! In development, email verification may
                not work. You can try to log in directly with your credentials.
              </AlertDescription>
            </Alert>
          )}

          {/* Debug info for development */}
          {process.env.NODE_ENV !== "production" && debugInfo && (
            <Alert>
              <AlertDescription>
                <details>
                  <summary>Debug Info (Development Only)</summary>
                  <pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
                </details>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {userEmail ? (
            <>
              <Button onClick={resendVerification} disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resend Verification Email
              </Button>

              {/* Development options */}
              {process.env.NODE_ENV !== "production" && (
                <Button onClick={handleDevDirectLogin} variant="secondary" className="w-full">
                  Development: Try Direct Login
                </Button>
              )}
            </>
          ) : (
            <Button onClick={handleSignUpAgain} className="w-full">
              Sign Up Again
            </Button>
          )}

          <Button variant="outline" onClick={() => router.push("/auth/login")} className="w-full">
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
