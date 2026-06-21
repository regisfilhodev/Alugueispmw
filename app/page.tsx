import { createClient } from "@/lib/supabase/server"
import { PropertyCard } from "@/components/property-card"
import { PropertyFilters } from "@/components/property-filters"
import { Button } from "@/components/ui/button"
import { Home, PlusCircle } from "lucide-react"
import Link from "next/link"


export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; minPrice?: string; maxPrice?: string; bedrooms?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
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
    .eq("status", "available")
    .order("created_at", { ascending: false })

  // Apply filters
  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,description.ilike.%${params.search}%,address.ilike.%${params.search}%`,
    )
  }

  if (params.type && params.type !== "all") {
    query = query.eq("property_type", params.type)
  }

  if (params.minPrice) {
    query = query.gte("price", Number.parseFloat(params.minPrice))
  }

  if (params.maxPrice) {
    query = query.lte("price", Number.parseFloat(params.maxPrice))
  }

  if (params.bedrooms) {
    query = query.gte("bedrooms", Number.parseInt(params.bedrooms))
  }

  const { data: properties, error } = await query

  if (error) {
    console.error("[v0] Error fetching properties:", error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <header className="border-b border-amber-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-amber-600" />
            <span className="text-xl font-bold text-amber-900">Palmas Imóveis</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-amber-900 hover:text-amber-600 hover:bg-amber-100">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <PlusCircle className="h-4 w-4 mr-2" />
                Anunciar Imóvel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4 text-balance">
            Encontre sua casa ideal em Palmas
          </h1>
          <p className="text-lg text-amber-700 text-pretty max-w-2xl mx-auto">
            A melhor plataforma para alugar imóveis em Palmas, Tocantins. Casas com piscina, ar condicionado e muito
            mais.
          </p>
        </div>

        {/* Filters */}
        <PropertyFilters />
      </section>

      {/* Properties Grid */}
      <section className="container mx-auto px-4 pb-16">
        {properties && properties.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-amber-900 mb-6">
              {properties.length} {properties.length === 1 ? "imóvel disponível" : "imóveis disponíveis"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Home className="h-16 w-16 text-amber-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-amber-900 mb-2">Nenhum imóvel encontrado</h3>
            <p className="text-amber-700 mb-6">Tente ajustar seus filtros de busca</p>
            <Link href="/">
              <Button variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100 bg-transparent">
                Limpar filtros
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-amber-700">
          <p>© 2026 Palmas Imóveis. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
