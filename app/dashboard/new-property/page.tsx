"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface Amenity {
  id: string
  name: string
  icon: string | null
}

export default function NewPropertyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  // Form fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [address, setAddress] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [areaSqm, setAreaSqm] = useState("")
  const [propertyType, setPropertyType] = useState("house")
  const [whatsapp, setWhatsapp] = useState("")

  useEffect(() => {
    async function fetchAmenities() {
      const supabase = createClient()
      const { data, error } = await supabase.from("amenities").select("*").order("name")

      if (error) {
        console.error("[v0] Error fetching amenities:", error)
      } else if (data) {
        setAmenities(data)
      }
    }

    fetchAmenities()
  }, [])

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((id) => id !== amenityId) : [...prev, amenityId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Você precisa estar autenticado para criar um imóvel")
      }

      // Insert property
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
          owner_id: user.id,
          title,
          description,
          price: Number.parseFloat(price),
          address,
          bedrooms: Number.parseInt(bedrooms),
          bathrooms: Number.parseInt(bathrooms),
          area_sqm: Number.parseInt(areaSqm),
          property_type: propertyType,
          whatsapp,
          status: "available",
        })
        .select()
        .single()

      if (propertyError) throw propertyError

      // Insert property amenities
      if (selectedAmenities.length > 0 && property) {
        const amenityInserts = selectedAmenities.map((amenityId) => ({
          property_id: property.id,
          amenity_id: amenityId,
        }))

        const { error: amenitiesError } = await supabase.from("property_amenities").insert(amenityInserts)

        if (amenitiesError) throw amenitiesError
      }

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      console.error("[v0] Error creating property:", err)
      setError(err instanceof Error ? err.message : "Erro ao criar imóvel")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 text-amber-900 hover:text-amber-600 hover:bg-amber-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o Dashboard
          </Button>
        </Link>

        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900">Anunciar Novo Imóvel</CardTitle>
            <CardDescription className="text-amber-700">
              Preencha as informações abaixo para criar seu anúncio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-900">Informações Básicas</h3>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-amber-900">
                    Título do Anúncio *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Casa espaçosa com piscina"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-amber-900">
                    Descrição *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o imóvel, seus diferenciais e comodidades..."
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertyType" className="text-amber-900">
                      Tipo de Imóvel *
                    </Label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger id="propertyType" className="border-amber-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">Casa</SelectItem>
                        <SelectItem value="apartment">Apartamento</SelectItem>
                        <SelectItem value="condo">Condomínio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-amber-900">
                      Valor do Aluguel (R$/mês) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="2500"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="border-amber-200 focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-amber-900">
                    Endereço *
                  </Label>
                  <Input
                    id="address"
                    placeholder="Rua, número, bairro - Palmas/TO"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-900">Detalhes do Imóvel</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms" className="text-amber-900">
                      Quartos *
                    </Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      placeholder="3"
                      required
                      min="1"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="border-amber-200 focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms" className="text-amber-900">
                      Banheiros *
                    </Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      placeholder="2"
                      required
                      min="1"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="border-amber-200 focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="areaSqm" className="text-amber-900">
                      Área (m²) *
                    </Label>
                    <Input
                      id="areaSqm"
                      type="number"
                      placeholder="120"
                      required
                      min="1"
                      value={areaSqm}
                      onChange={(e) => setAreaSqm(e.target.value)}
                      className="border-amber-200 focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-900">Comodidades</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity.id}
                        checked={selectedAmenities.includes(amenity.id)}
                        onCheckedChange={() => handleAmenityToggle(amenity.id)}
                      />
                      <Label
                        htmlFor={amenity.id}
                        className="text-sm font-normal text-amber-900 cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {amenity.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-900">Contato</h3>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-amber-900">
                    WhatsApp *
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="(63) 99999-9999"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="border-amber-200 focus:border-amber-400"
                  />
                  <p className="text-sm text-amber-600">
                    Os interessados entrarão em contato através deste número pelo WhatsApp
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando anúncio..." : "Publicar Imóvel"}
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-amber-300 text-amber-900 hover:bg-amber-100 bg-transparent"
                  >
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
