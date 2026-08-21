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
  vehicles: { registration_number: string; make: string; model: string } | null
}

export default function InspectionsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'complete' | 'open'>('all')
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
        .select('id,inspection_type,status,started_at,contract_ref,vehicles(registration_number,make,model)')
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

  const filtered = allInspections
    .filter(r => filter === 'all' ? true : r.status === filter)
    .filter(r => search.trim() === '' ? true :
      r.vehicles?.registration_number?.toUpperCase().includes(search.toUpperCase()))

  const completeCount = allInspections.filter(r => r.status === 'complete').length
  const openCount = allInspections.filter(r => r.status === 'open').length

  return (
    <main className="min-h-screen">
      <div className="brand-header text-white px-6 pt-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.push('/dashboard')}
            className="text-slate-400 text-xs mb-4 hover:text-white transition-colors">← Dashboard</button>
          <h1 className="text-2xl font-bold">Inspection history</h1>
          <p className="text-slate-400 text-sm mt-1">Search past inspections and photo evidence</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8 relative z-10 pb-10">
        <div className="bg-white rounded-xl border border-slate-200 card-elevated p-5 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(formatReg(e.target.value))}
            maxLength={10}
            placeholder="Filter by registration e.g. GR-2045-21"
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 mb-3"
          />
          <div className="flex gap-2">
            {([
              ['all', `All (${allInspections.length})`],
              ['complete', `Complete (${completeCount})`],
              ['open', `Open (${openCount})`]
            ] as const).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  filter === key
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-400 text-sm">Loading inspections...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-400 text-sm">
              {search ? 'No inspections found for this registration.' : 'No inspections recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r) => (
              <div key={r.id}
                onClick={() => router.push(`/inspections/${r.id}`)}
                className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-slate-400 transition-all card-elevated">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 font-mono tracking-wide">
                        {r.vehicles?.registration_number}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize border ${
                        r.inspection_type === 'handover'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>{r.inspection_type}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {r.vehicles?.make} {r.vehicles?.model}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(r.started_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    {r.contract_ref && (
                      <p className="text-xs text-slate-400 mt-0.5">Ref: {r.contract_ref}</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                    r.status === 'complete'
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}