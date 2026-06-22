import { createClient } from "@/lib/supabase/server"
import { PropertyCard } from "@/components/property-card"
import { PropertyFilters } from "@/components/property-filters"
import { Button } from "@/components/ui/button"
import { Home, PlusCircle, Building2, MapPin, Search } from "lucide-react"
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
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Palmas <span className="text-primary">Imóveis</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hidden sm:inline-flex">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-full px-6">
                <PlusCircle className="h-4 w-4 mr-2" />
                Anunciar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.15),rgba(255,255,255,0))]" />
          <div className="absolute top-0 right-0 -z-10 w-full h-full bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')] bg-cover bg-center opacity-5 dark:opacity-10 mix-blend-luminosity" />
          
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-8 text-sm font-medium">
                <MapPin className="h-4 w-4" />
                <span>Exclusividade em Palmas, Tocantins</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                Encontre o imóvel <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
                  dos seus sonhos
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Descubra casas, apartamentos e condomínios de alto padrão com as melhores condições e comodidades da cidade.
              </p>

              {/* Elevated Filters Search Bar */}
              <div className="bg-card/50 backdrop-blur-xl border border-border shadow-2xl shadow-primary/5 rounded-3xl p-4 sm:p-6 mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                <PropertyFilters />
              </div>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="container mx-auto px-4 pb-24">
          {properties && properties.length > 0 ? (
            <div className="animate-in fade-in duration-1000 delay-300">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground tracking-tight">Imóveis em Destaque</h2>
                  <p className="text-muted-foreground mt-2">
                    {properties.length} {properties.length === 1 ? "imóvel disponível" : "imóveis disponíveis"} para você
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in">
              <div className="bg-primary/10 p-6 rounded-full mb-6">
                <Search className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Nenhum imóvel encontrado</h3>
              <p className="text-muted-foreground max-w-md mb-8 text-lg">
                Não conseguimos encontrar propriedades com os filtros atuais. Tente ajustar sua busca.
              </p>
              <Link href="/">
                <Button variant="outline" size="lg" className="rounded-full border-border hover:bg-muted">
                  Limpar todos os filtros
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">Palmas Imóveis</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Palmas Imóveis. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
