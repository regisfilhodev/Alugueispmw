import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function EditPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = (params && typeof (params as any).then === 'function') ? await (params as Promise<{ id: string }>) : (params as { id: string })

  const id = resolvedParams?.id
  if (!id) {
    return <div className="p-8">ID do imóvel inválido</div>
  }

  const supabase = await createClient()
  
  // ✅ VERIFICAR AUTENTICAÇÃO
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  
  let property: any = null

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)  // ✅ VERIFICAR PROPRIETÁRIO
      .single()
    
    if (error || !data) throw new Error('Propriedade não encontrada ou acesso negado')
    property = data
  } catch (err) {
    console.error('[v0] Error fetching property:', err)
    return <div className="p-8">Propriedade não encontrada ou acesso negado.</div>
  }

  if (!property) {
    return <div className="p-8">Imóvel não encontrado</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Editar Imóvel: {property.title}</h1>
      <p className="mb-2">Endereço: {property.address}</p>
      <p className="mb-2">Preço: R$ {property.price}</p>

      <p className="mt-4">O formulário de edição completo ainda não está implementado aqui.</p>
      <p className="mt-2">Você pode abrir o formulário de criação com o parâmetro <code>?editId={property.id}</code> para começar a implementar a edição baseada no mesmo componente.</p>

      <Link href={`/dashboard/new-property?editId=${property.id}`}>
        <button className="mt-4 px-4 py-2 bg-amber-600 text-white rounded">Abrir editor (experimental)</button>
      </Link>
    </div>
  )
}
