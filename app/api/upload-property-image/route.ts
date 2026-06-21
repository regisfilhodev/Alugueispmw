import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, uploadLimiter } from "@/lib/rate-limit"

// ✅ VALIDAÇÃO DE MAGIC BYTES
function isValidImageMagic(bytes: Uint8Array): boolean {
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return true
  
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return true
  
  // GIF: 47 49 46
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return true
  
  // WebP: RIFF ... WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return true
  }
  
  return false
}

// ✅ VALIDAÇÃO DE EXTENSÃO
function isValidImageExtension(filename: string): boolean {
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  const ext = filename.split('.').pop()?.toLowerCase()
  return validExtensions.includes(ext || '')
}

// ✅ MAPEAR EXTENSÃO PARA MIME TYPE
function getMimeType(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeMap: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif'
  }
  return mimeMap[ext || ''] || null
}

// Create an admin client with service role key for bypassing RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const propertyId = formData.get("propertyId") as string
    const fileIndex = formData.get("fileIndex") as string
    const isPrimary = formData.get("isPrimary") as string

    // ✅ VALIDAÇÃO BÁSICA
    if (!file || !propertyId) {
      return NextResponse.json(
        { error: "File and propertyId are required" },
        { status: 400 }
      )
    }

    // ✅ LIMITE DE TAMANHO
    const MAX_SIZE = 5 * 1024 * 1024  // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 5MB." },
        { status: 413 }
      )
    }

    // ✅ VALIDAR EXTENSÃO
    const safeName = file.name
      ? file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120)
      : `file-${fileIndex}`

    if (!isValidImageExtension(safeName)) {
      return NextResponse.json(
        { error: "Tipo de arquivo inválido. Apenas imagens são permitidas." },
        { status: 400 }
      )
    }

    // Verificar autenticação
    const supabaseAuth = await createServerClient()
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // ✅ VERIFICAR RATE LIMIT
    const { success, remaining, retryAfter } = await checkRateLimit(user.id, uploadLimiter)
    
    if (!success) {
      return NextResponse.json(
        { error: "Limite de uploads excedido. Tente novamente em 1 hora." },
        { status: 429, headers: { "Retry-After": retryAfter?.toString() || "3600" } }
      )
    }

    // Use admin client for storage and property checks
    const adminClient = getAdminClient()

    // Verify user owns the property
    const { data: property, error: propError } = await adminClient
      .from("properties")
      .select("owner_id")
      .eq("id", propertyId)
      .single()

    if (propError || !property) {
      console.error("[v0] Property check error:", propError)
      return NextResponse.json(
        { error: "Propriedade não encontrada." },
        { status: 404 }
      )
    }

    if (property.owner_id !== user.id) {
      return NextResponse.json(
        { error: "Acesso negado." },
        { status: 403 }
      )
    }

    // ✅ VALIDAR MAGIC BYTES
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const bytes = new Uint8Array(buffer)

    if (!isValidImageMagic(bytes)) {
      return NextResponse.json(
        { error: "Arquivo não é uma imagem válida." },
        { status: 400 }
      )
    }

    // ✅ USAR MIME TYPE CORRETO
    const mimeType = getMimeType(safeName) || 'image/jpeg'

    // Upload to storage using admin client
    const bucket = "property-images"
    const filePath = `${propertyId}/${Date.now()}-${fileIndex}-${safeName}`

    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: mimeType,  // ✅ MIME TYPE VALIDADO
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("[v0] Storage upload error:", uploadError)
      return NextResponse.json(
        { error: "Erro ao fazer upload." },  // ✅ MENSAGEM GENÉRICA
        { status: 500 }
      )
    }

    const { data: publicData } = await adminClient.storage
      .from(bucket)
      .getPublicUrl(filePath)

    const imageUrl = publicData.publicUrl

    // Insert image record using admin client
    const { data: imageData, error: insertError } = await adminClient
      .from("property_images")
      .insert({
        property_id: propertyId,
        image_url: imageUrl,
        is_primary: isPrimary === "true",
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Image insert error:", insertError)
      return NextResponse.json(
        { error: "Erro ao processar imagem." },  // ✅ MENSAGEM GENÉRICA
        { status: 500 }
      )
    }

    return NextResponse.json(
      { data: imageData, url: imageUrl },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Upload endpoint error:", error)
    return NextResponse.json(
      { error: "Erro ao processar requisição." },  // ✅ MENSAGEM GENÉRICA
      { status: 500 }
    )
  }
}
