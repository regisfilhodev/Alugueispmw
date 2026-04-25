import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="w-full max-w-sm">
        <Card className="border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-900">Algo deu errado</CardTitle>
          </CardHeader>
          <CardContent>
            {params?.error ? (
              <p className="text-sm text-center text-red-800">Código do erro: {params.error}</p>
            ) : (
              <p className="text-sm text-center text-red-800">Ocorreu um erro não especificado.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
