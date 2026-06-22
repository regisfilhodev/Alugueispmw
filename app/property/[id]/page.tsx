"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import DOMPurify from 'isomorphic-dompurify'  // ✅ ADICIONAR IMPORT
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ChevronLeft, ChevronRight, BedDouble, Bath, Maximize, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface PropertyDetail {
  id: string
  title: string
  description: string
  price: number
  address: string
  bedrooms: number
  bathrooms: number
  area_sqm: number
  property_type: string
  whatsapp: string
  created_at: string
  property_images?: { id: string; image_url: string; is_primary: boolean }[]
  property_amenities?: { amenities: { id: string; name: string; icon: string | null } }[]
  profiles?: { full_name: string; phone: string | null }
}

export default function PropertyDetailPage() {
  const params = useParams()
  const propertyId = params.id as string

  const [property, setProperty] = useState<PropertyDetail | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProperty() {
      try {
        const supabase = createClient()

        const { data, error: fetchError } = await supabase
          .from("properties")
          .select(
            `
            *,
            property_images(id, image_url, is_primary),
            property_amenities(amenities(id, name, icon)),
            profiles(full_name, phone)
            `
          )
          .eq("id", propertyId)
          .eq("status", "available")
          .single()

        if (fetchError) throw fetchError
        setProperty(data as PropertyDetail)
      } catch (err) {
        console.error("[v0] Error fetching property:", err)
        setError(err instanceof Error ? err.message : "Erro ao carregar o imóvel")
      } finally {
        setIsLoading(false)
      }
    }

    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 flex items-center justify-center">
        <div className="text-amber-900">Carregando...</div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
        <div className="container mx-auto px-4">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-amber-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="text-center text-amber-900">
            <h1 className="text-2xl font-bold mb-2">Imóvel não encontrado</h1>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const images = property.property_images || []
  const currentImage = images.length > 0 ? images[currentImageIndex] : null

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const typeLabels: Record<string, string> = {
    house: "Casa",
    apartment: "Apartamento",
    condo: "Condomínio",
  }

  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse no imóvel "${property.title}" anunciado por R$ ${property.price.toLocaleString("pt-BR")}/mês.`,
  )
  const whatsappLink = `https://wa.me/${property.whatsapp.replace(/\D/g, "")}?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-amber-900 hover:text-amber-600 hover:bg-amber-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Anúncios
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Galeria de Imagens - Coluna Principal */}
          <div className="lg:col-span-2">
            {images.length > 0 ? (
              <Card className="border-amber-200 overflow-hidden">
                {/* Imagem Principal */}
                <div className="relative bg-amber-100 aspect-video flex items-center justify-center overflow-hidden">
                  <img
                    src={currentImage?.image_url || "/placeholder.svg"}
                    alt={`${property.title} - ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Controles de Navegação */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                        aria-label="Imagem anterior"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                        aria-label="Próxima imagem"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>

                      {/* Indicador de Página */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} de {images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-3">
                      {images.map((image, idx) => (
                        <button
                          key={image.id}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative aspect-video rounded-md overflow-hidden border-2 transition ${
                            idx === currentImageIndex
                              ? "border-amber-600"
                              : "border-amber-200 hover:border-amber-400"
                          }`}
                        >
                          <img
                            src={image.image_url}
                            alt={`Miniatura ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {image.is_primary && (
                            <div className="absolute top-1 right-1 bg-amber-600 text-white text-xs px-2 py-1 rounded">
                              Principal
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ) : (
              <Card className="border-amber-200 h-96 flex items-center justify-center">
                <div className="text-amber-600">Nenhuma imagem disponível</div>
              </Card>
            )}

            {/* Descrição */}
            <Card className="border-amber-200 mt-6">
              <CardHeader>
                <CardTitle className="text-amber-900">Descrição</CardTitle>
              </CardHeader>
              <CardContent className="text-amber-800 whitespace-pre-wrap">
                {/* ✅ SANITIZAR OUTPUT */}
                {DOMPurify.sanitize(property.description)}
              </CardContent>
            </Card>

            {/* Comodidades */}
            {property.property_amenities && property.property_amenities.length > 0 && (
              <Card className="border-amber-200 mt-6">
                <CardHeader>
                  <CardTitle className="text-amber-900">Comodidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {property.property_amenities.map((pa, idx) => (
                      <Badge key={idx} variant="outline" className="border-amber-300 text-amber-700 text-sm">
                        {pa.amenities?.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Informações Laterais */}
          <div className="lg:col-span-1">
            {/* Preço e Tipo */}
            <Card className="border-amber-200 mb-6">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-amber-600 uppercase font-semibold">Valor do Aluguel</p>
                    <p className="text-3xl font-bold text-amber-900">
                      R$ {property.price.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-sm text-amber-700">/mês</p>
                  </div>
                  <Badge className="bg-amber-600 text-white">{typeLabels[property.property_type]}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes */}
            <Card className="border-amber-200 mb-6">
              <CardHeader>
                <CardTitle className="text-lg text-amber-900">Detalhes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <BedDouble className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm text-amber-700">Quartos</p>
                    <p className="font-semibold text-amber-900">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Bath className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm text-amber-700">Banheiros</p>
                    <p className="font-semibold text-amber-900">{property.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Maximize className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm text-amber-700">Área</p>
                    <p className="font-semibold text-amber-900">{property.area_sqm} m²</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Localização */}
            <Card className="border-amber-200 mb-6">
              <CardHeader>
                <CardTitle className="text-lg text-amber-900">Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
                  {/* ✅ SANITIZAR OUTPUT */}
                  <p className="text-amber-800 break-words">{DOMPurify.sanitize(property.address)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Proprietário */}
            {property.profiles && (
              <Card className="border-amber-200 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg text-amber-900">Proprietário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* ✅ SANITIZAR OUTPUT */}
                  <p className="font-semibold text-amber-900">{DOMPurify.sanitize(property.profiles.full_name)}</p>
                  {property.profiles.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-amber-600" />
                      <a href={`tel:${property.profiles.phone}`} className="text-amber-600 hover:underline">
                        {DOMPurify.sanitize(property.profiles.phone)}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* CTA WhatsApp */}
            <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full block">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg">
                💬 Chamar no WhatsApp
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
