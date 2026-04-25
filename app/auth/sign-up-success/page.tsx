import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="w-full max-w-sm">
        <Card className="border-amber-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Mail className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle className="text-2xl text-amber-900">Verifique seu email</CardTitle>
            <CardDescription className="text-amber-700">Enviamos um link de confirmação</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-amber-800">
              Você se cadastrou com sucesso! Por favor, verifique seu email para confirmar sua conta antes de fazer
              login.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
