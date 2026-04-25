import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { BedDouble, Bath, Maximize, MessageCircle } from "lucide-react"
import Link from "next/link"

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
  const primaryImage = property.property_images?.find((img) => img.is_primary)
  const imageUrl =
    primaryImage?.image_url ||
    property.property_images?.[0]?.image_url ||
    `/placeholder.svg?height=300&width=400&query=house in palmas brazil`

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

  return (
    <Card className="overflow-hidden border-amber-200 hover:shadow-lg transition-shadow">
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
        <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
            <MessageCircle className="h-4 w-4 mr-2" />
            Chamar no WhatsApp
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
