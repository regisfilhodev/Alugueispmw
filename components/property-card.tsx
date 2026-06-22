"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { BedDouble, Bath, Maximize, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface PropertyCardProps {
  property: {
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
    property_images?: { image_url: string; is_primary: boolean }[]
    property_amenities?: { amenities: { name: string; icon: string | null } | null }[]
    profiles?: { full_name: string; phone: string | null } | null
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter()
  const primaryImage = property.property_images?.find((img) => img.is_primary)
  const imageUrl =
    primaryImage?.image_url ||
    property.property_images?.[0]?.image_url ||
    `/placeholder.svg?height=400&width=600&query=luxury+house+modern`

  const typeLabels: Record<string, string> = {
    house: "Casa",
    apartment: "Apartamento",
    condo: "Condomínio",
  }

  const amenities =
    property.property_amenities
      ?.slice(0, 3)
      .map((pa) => pa.amenities?.name)
      .filter(Boolean) || []

  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse no imóvel "${property.title}" anunciado por R$ ${property.price.toLocaleString("pt-BR")}/mês.`,
  )
  const whatsappLink = `https://wa.me/${property.whatsapp.replace(/\D/g, "")}?text=${whatsappMessage}`

  const handleCardClick = () => {
    router.push(`/property/${property.id}`)
  }

  return (
    <Card
      className="overflow-hidden border-amber-200 hover:shadow-lg transition-shadow cursor-pointer hover:scale-[1.02] transition-transform"
      onClick={handleCardClick}
    >
        <div className="relative h-48 overflow-hidden">
          <img src={imageUrl || "/placeholder.svg"} alt={property.title} className="w-full h-full object-cover" />
          <Badge className="absolute top-3 right-3 bg-amber-600 text-white">{typeLabels[property.property_type]}</Badge>
        </div>

        <CardContent className="p-4">
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-amber-900 line-clamp-1">{property.title}</h3>
            <p className="text-sm text-amber-700 line-clamp-1">{property.address}</p>
          </div>

          <p className="text-2xl font-bold text-amber-600 mb-3">
            R$ {property.price.toLocaleString("pt-BR")}
            <span className="text-sm text-amber-700 font-normal">/mês</span>
          </p>

          <div className="flex items-center gap-4 text-sm text-amber-700 mb-3">
            <div className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" />
              <span>{property.bedrooms} quartos</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms} banheiros</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              <span>{property.area_sqm}m²</span>
            </div>
  return (
    <Card className="overflow-hidden border-border/50 bg-card hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group flex flex-col">
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 z-10" />
        <img 
          src={imageUrl || "/placeholder.svg"} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <Badge className="absolute top-4 right-4 z-20 bg-background/80 backdrop-blur-md text-foreground border-none shadow-sm font-medium px-3 py-1">
          {typeLabels[property.property_type]}
        </Badge>
        <div className="absolute bottom-4 left-4 z-20">
          <p className="text-2xl font-bold text-white drop-shadow-md">
            R$ {property.price.toLocaleString("pt-BR")}
            <span className="text-sm font-normal opacity-80">/mês</span>
          </p>
        </div>
      </div>

      <CardContent className="p-5 flex-1">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{property.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{property.address}</p>
        </div>

        <div className="flex items-center justify-between py-4 border-y border-border/50 mb-4">
          <div className="flex flex-col items-center justify-center gap-1">
            <BedDouble className="h-5 w-5 text-primary/70" />
            <span className="text-xs font-medium text-muted-foreground">{property.bedrooms} Quartos</span>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="flex flex-col items-center justify-center gap-1">
            <Bath className="h-5 w-5 text-primary/70" />
            <span className="text-xs font-medium text-muted-foreground">{property.bathrooms} Banh.</span>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="flex flex-col items-center justify-center gap-1">
            <Maximize className="h-5 w-5 text-primary/70" />
            <span className="text-xs font-medium text-muted-foreground">{property.area_sqm} m²</span>
          </div>
        </div>

        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {amenities.map((amenity, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold bg-secondary/50 text-secondary-foreground hover:bg-secondary">
                {amenity}
              </Badge>
            ))}
          </div>

          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, idx) => (
                <Badge key={idx} variant="outline" className="text-xs border-amber-300 text-amber-700">
                  {amenity}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full" onClick={(e) => e.stopPropagation()}>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chamar no WhatsApp
            </Button>
          </Link>
        </CardFooter>
      </Card>
      <CardFooter className="p-5 pt-0 mt-auto">
        <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg shadow-[#25D366]/20 transition-all group-hover:shadow-[#25D366]/40">
            <MessageCircle className="h-5 w-5 mr-2" />
            Contatar via WhatsApp
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}