import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, Plane } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plane className="h-8 w-8 text-cyan-600" />
            <h1 className="text-2xl font-bold text-gray-900">TravelAI</h1>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-cyan-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription className="text-base">
              We've sent you a verification link to confirm your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Next steps:</strong>
              </p>
              <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>Return here to sign in and start planning</li>
              </ol>
            </div>

            <div className="text-center">
              <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                <Link href="/auth/login">Back to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
