import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Plataforma de Construccion
        </h1>
        <p className="text-sm text-muted-foreground">
          Ingresa con tu cuenta para continuar
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
