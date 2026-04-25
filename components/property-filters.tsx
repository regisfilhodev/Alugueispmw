"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export function PropertyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [type, setType] = useState(searchParams.get("type") || "all")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "any")
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (type && type !== "all") params.set("type", type)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    if (bedrooms && bedrooms !== "any") params.set("bedrooms", bedrooms)

    router.push(`/?${params.toString()}`)
  }

  const handleClear = () => {
    setSearch("")
    setType("all")
    setMinPrice("")
    setMaxPrice("")
    setBedrooms("any")
    router.push("/")
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-amber-200">
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar por endereço, título ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="border-amber-200 focus:border-amber-400"
            />
          </div>
          <Button onClick={handleSearch} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>

        {/* Toggle Advanced Filters */}
        <Button
          variant="ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-amber-700 hover:text-amber-900 hover:bg-amber-50 w-fit"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {showAdvanced ? "Ocultar filtros avançados" : "Mostrar filtros avançados"}
        </Button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-amber-100">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-amber-900">
                Tipo de Imóvel
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type" className="border-amber-200">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="condo">Condomínio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minPrice" className="text-amber-900">
                Preço Mínimo
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="R$ 0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border-amber-200 focus:border-amber-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice" className="text-amber-900">
                Preço Máximo
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="R$ 10.000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border-amber-200 focus:border-amber-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms" className="text-amber-900">
                Quartos
              </Label>
              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger id="bedrooms" className="border-amber-200">
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 lg:col-span-4 flex gap-2">
              <Button onClick={handleSearch} className="bg-amber-600 hover:bg-amber-700 text-white">
                Aplicar Filtros
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="border-amber-300 text-amber-900 hover:bg-amber-100 bg-transparent"
              >
                Limpar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
