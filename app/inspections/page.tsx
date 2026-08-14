'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
type InspectionRow = {
  id: string
  inspection_type: string
  status: string
  started_at: string
  vehicles: { registration_number: string } | null
}
export default function InspectionsPage() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<InspectionRow[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const router = useRouter()
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSearched(true)
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data } = await supabase.from('inspection_records').select('id,inspection_type,status,started_at,vehicles(registration_number)').order('started_at',{ascending:false}).limit(50)
    const rows = (data || []) as unknown as InspectionRow[]
    const filtered = rows.filter((r)=>r.vehicles?.registration_number?.toUpperCase().includes(search.toUpperCase()))
    setResults(filtered)
    setLoading(false)
  }
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={()=>router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 text-sm">Back</button>
            <h1 className="text-lg font-bold text-gray-900">Inspection history</h1>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} required placeholder="Vehicle registration e.g. GR-2045-21" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <button type="submit" disabled={loading} className="bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50">{loading?'...':'Search'}</button>
          </form>
          {searched && results.length===0 && <div className="text-center py-8"><p className="text-gray-400 text-sm">No records found.</p></div>}
          {results.length>0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{results.length} record{results.length!==1?'s':''} found</p>
              {results.map((r)=>(
                <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.vehicles?.registration_number}</p>
                      <p className="text-xs text-gray-600 mt-0.5 capitalize">{r.inspection_type}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(r.started_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
                    </div>
                    <span className={"text-xs font-medium px-2 py-1 rounded-full "+(r.status==='complete'?'bg-teal-50 text-teal-700':'bg-amber-50 text-amber-700')}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
