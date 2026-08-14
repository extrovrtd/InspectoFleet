'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function InspectionsPage() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const router = useRouter()

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSearched(true)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data } = await supabase
      .from('inspection_records')
      .select(`
        id,
        inspection_type,
        status,
        contract_ref,
        started_at,
        vehicles (registration_number)
      `)
      .eq('vehicles.registration_number', search.toUpperCase())
      .not('vehicles', 'is', null)
      .order('started_at', { ascending: false })

    setResults(data || [])
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
            <h1 className="text-lg font-bold text-gray-900">Inspection history</h1>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              required
              placeholder="Vehicle registration (e.g. GR-2045-21)"
             className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button type="submit" disabled={loading}
              className="bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
              {loading ? '...' : 'Search'}
            </button>
          </form>

          {searched && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No inspection records found for this vehicle.</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{results.length} inspection{results.length !== 1 ? 's' : ''} found</p>
              {results.map((r) => (
                <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{r.inspection_type}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(r.started_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      {r.contract_ref && (
                        <p className="text-xs text-gray-400 mt-0.5">Ref: {r.contract_ref}</p>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      r.status === 'complete'
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-2 font-mono">{r.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}