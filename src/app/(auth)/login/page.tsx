import { LoginForm } from "@/components/auth/login-form"
import { Logo } from "@/components/brand/logo"

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Logo variant="dark" size="lg" />
        <p className="text-sm text-muted-foreground">
          Ingresa con tu cuenta para continuar
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
