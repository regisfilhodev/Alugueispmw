"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BedDouble, Bath, Maximize, MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface PropertyManagementCardProps {
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
    status: string
    whatsapp: string
    property_images?: { image_url: string; is_primary: boolean }[]
    property_amenities?: { amenities: { name: string; icon: string | null } | null }[]
  }
}

export function PropertyManagementCard({ property }: PropertyManagementCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const primaryImage = property.property_images?.find((img) => img.is_primary)
  const imageUrl =
    primaryImage?.image_url ||
    property.property_images?.[0]?.image_url ||
    `/placeholder.svg?height=200&width=300&query=house in palmas brazil`

  const typeLabels: Record<string, string> = {
    house: "Casa",
    apartment: "Apartamento",
    condo: "Condomínio",
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    available: { label: "Disponível", color: "bg-green-100 text-green-800 border-green-300" },
    rented: { label: "Alugado", color: "bg-blue-100 text-blue-800 border-blue-300" },
    pending: { label: "Pendente", color: "bg-amber-100 text-amber-800 border-amber-300" },
  }

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este imóvel?")) {
      return
    }

    setIsDeleting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("properties").delete().eq("id", property.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[v0] Error deleting property:", error)
      alert("Erro ao excluir imóvel. Tente novamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("properties").update({ status: newStatus }).eq("id", property.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating status:", error)
      alert("Erro ao atualizar status. Tente novamente.")
    }
  }

  return (
    <Card className="border-amber-200 hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Image */}
          <div className="relative w-full md:w-48 h-48 flex-shrink-0">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={property.title}
              className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-6 md:pl-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-amber-900">{property.title}</h3>
                  <Badge variant="outline" className="border-amber-300 text-amber-700">
                    {typeLabels[property.property_type]}
                  </Badge>
                  <Badge className={statusLabels[property.status].color}>{statusLabels[property.status].label}</Badge>
                </div>
                <p className="text-sm text-amber-700 line-clamp-1 mb-2">{property.address}</p>
                <p className="text-xl font-bold text-amber-600">
                  R$ {property.price.toLocaleString("pt-BR")}
                  <span className="text-sm text-amber-700 font-normal">/mês</span>
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-amber-900 hover:text-amber-600 hover:bg-amber-100"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="cursor-pointer">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/dashboard/new-property?editId=${property.id}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  {property.status === "available" && (
                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatusChange("rented")}>
                      Marcar como Alugado
                    </DropdownMenuItem>
                  )}
                  {property.status === "rented" && (
                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatusChange("available")}>
                      Marcar como Disponível
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Excluindo..." : "Excluir"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-4 text-sm text-amber-700">
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
