import { AuthForm } from "@/components/auth/auth-form"

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <AuthForm mode="signup" />
    </div>
  )
}
