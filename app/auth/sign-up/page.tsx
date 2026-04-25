"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="w-full max-w-sm">
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900">Cadastrar</CardTitle>
            <CardDescription className="text-amber-700">Crie sua conta para anunciar imóveis</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="text-amber-900">
                    Nome Completo
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-amber-900">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(63) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-amber-900">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-amber-900">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password" className="text-amber-900">
                    Repetir Senha
                  </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Cadastrar"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-amber-700">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="underline underline-offset-4 text-amber-900 hover:text-amber-600">
                  Entrar
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
