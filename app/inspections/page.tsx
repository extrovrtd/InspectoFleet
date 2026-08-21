'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

type InspectionRow = {
  id: string
  inspection_type: string
  status: string
  started_at: string
  contract_ref: string | null
  vehicles: { registration_number: string } | null
}

export default function InspectionsPage() {
  const [search, setSearch] = useState('')
  const [allInspections, setAllInspections] = useState<InspectionRow[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadAll() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data } = await supabase
        .from('inspection_records')
        .select('id,inspection_type,status,started_at,contract_ref,vehicles(registration_number)')
        .order('started_at', { ascending: false })
        .limit(100)
      setAllInspections((data || []) as unknown as InspectionRow[])
      setLoading(false)
    }
    loadAll()
  }, [])

  function formatReg(value: string) {
    const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    let formatted = raw
    if (raw.length > 2) formatted = raw.slice(0, 2) + '-' + raw.slice(2)
    if (raw.length > 6) formatted = raw.slice(0, 2) + '-' + raw.slice(2, 6) + '-' + raw.slice(6, 8)
    return formatted
  }

  const filtered = search.trim() === ''
    ? allInspections
    : allInspections.filter(r =>
        r.vehicles?.registration_number?.toUpperCase().includes(search.toUpperCase().replace(/-/g, ''))
        || r.vehicles?.registration_number?.toUpperCase().includes(search.toUpperCase())
      )

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
            <h1 className="text-lg font-bold text-gray-900">Inspection history</h1>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(formatReg(e.target.value))}
            maxLength={10}
            placeholder="Filter by registration e.g. GR-1234-21"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-6"
          />

          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading inspections...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              {search ? 'No inspections found for this registration.' : 'No inspections recorded yet.'}
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                {filtered.length} inspection{filtered.length !== 1 ? 's' : ''}
                {search && ` matching "${search}"`}
              </p>
              {filtered.map((r) => (
                <div key={r.id}
                  onClick={() => router.push(`/inspections/${r.id}`)}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {r.vehicles?.registration_number}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5 capitalize">{r.inspection_type}</p>
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
                      r.status === 'complete' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                    }`}>{r.status}</span>
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