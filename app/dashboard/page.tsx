import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, PlusCircle, LogOut } from "lucide-react"
import Link from "next/link"
import { PropertyManagementCard } from "@/components/property-management-card"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user properties
  const { data: properties, error } = await supabase
    .from("properties")
    .select(
      `
      *,
      property_images(image_url, is_primary),
      property_amenities(
        amenities(name, icon)
      )
    `,
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching properties:", error)
  }

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="border-b border-amber-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-amber-600" />
            <span className="text-xl font-bold text-amber-900">Palmas Imóveis</span>
          </Link>
          <form action={handleSignOut}>
            <Button variant="ghost" className="text-amber-900 hover:text-amber-600 hover:bg-amber-100">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Olá, {profile?.full_name || "Proprietário"}!</h1>
          <p className="text-amber-700">Gerencie seus imóveis anunciados</p>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardDescription className="text-amber-700">Total de Imóveis</CardDescription>
              <CardTitle className="text-3xl text-amber-900">{properties?.length || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardDescription className="text-amber-700">Disponíveis</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {properties?.filter((p) => p.status === "available").length || 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardDescription className="text-amber-700">Alugados</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {properties?.filter((p) => p.status === "rented").length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <Link href="/dashboard/new-property">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Anunciar Novo Imóvel
            </Button>
          </Link>
        </div>

        {/* Properties List */}
        <div>
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Meus Imóveis</h2>

          {properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {properties.map((property) => (
                <PropertyManagementCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <Card className="border-amber-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Home className="h-16 w-16 text-amber-300 mb-4" />
                <h3 className="text-xl font-semibold text-amber-900 mb-2">Nenhum imóvel anunciado</h3>
                <p className="text-amber-700 mb-6 text-center">Comece anunciando seu primeiro imóvel</p>
                <Link href="/dashboard/new-property">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Anunciar Imóvel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
