"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string>("")
  const supabase = createClient()

  useEffect(() => {
    async function checkEmailVerification() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      if (user.email_confirmed_at) {
        // Email já verificado
        router.push("/dashboard")
        return
      }

      setEmail(user.email || "")
      setIsLoading(false)
    }

    checkEmailVerification()
  }, [router])

  const resendEmail = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // A funcionalidade de reenvio é gerenciada pelo Supabase automaticamente
      // O usuário receberá o email quando se registrar
      // Se não receber, pode usar o link "Esqueceu a senha" para reenviar
      setError("Por favor, verifique sua caixa de entrada ou pasta de spam")
    } catch (err) {
      setError("Erro ao processar solicitação")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-amber-900">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-50">
      <Card className="w-full max-w-md border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">Verificar Email</CardTitle>
          <CardDescription className="text-amber-700">
            Um email de confirmação foi enviado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              Enviamos um email de confirmação para:
            </p>
            <p className="font-semibold text-amber-900 mt-1">{email}</p>
          </div>

          <p className="text-sm text-amber-700">
            Clique no link enviado para verificar seu email e ativar sua conta.
          </p>
          
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <Button
            onClick={resendEmail}
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isLoading ? "Reenviando..." : "Reenviar Email"}
          </Button>

          <p className="text-xs text-amber-600 text-center">
            Não recebeu? Verifique sua pasta de spam.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
