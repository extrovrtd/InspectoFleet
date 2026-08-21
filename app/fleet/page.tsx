'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

type Vehicle = {
  id: string
  registration_number: string
  make: string
  model: string
  year: number
  current_status: string
}

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function loadVehicles() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data } = await supabase
        .from('vehicles')
        .select('id, registration_number, make, model, year, current_status')
        .order('registration_number')
      setVehicles((data || []) as Vehicle[])
      setLoading(false)
    }
    loadVehicles()
  }, [])

  function formatReg(value: string) {
    const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    let formatted = raw
    if (raw.length > 2) formatted = raw.slice(0, 2) + '-' + raw.slice(2)
    if (raw.length > 6) formatted = raw.slice(0, 2) + '-' + raw.slice(2, 6) + '-' + raw.slice(6, 8)
    return formatted
  }

  const filtered = vehicles
    .filter(v => filter === 'all' ? true : v.current_status === filter)
    .filter(v => search.trim() === '' ? true :
      v.registration_number.toUpperCase().includes(search.toUpperCase()))

  const availableCount = vehicles.filter(v => v.current_status === 'Available').length
  const rentedCount = vehicles.filter(v => v.current_status === 'Rented').length
  const inspectingCount = vehicles.filter(v => v.current_status === 'Under Inspection').length

  const statusStyle = (status: string) => {
    if (status === 'Available') return 'bg-teal-50 text-teal-700 border-teal-200'
    if (status === 'Rented') return 'bg-blue-50 text-blue-700 border-blue-200'
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }

  return (
    <main className="min-h-screen">
      <div className="brand-header text-white px-6 pt-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.push('/dashboard')}
            className="text-slate-400 text-xs mb-4 hover:text-white transition-colors">← Dashboard</button>
          <h1 className="text-2xl font-bold">Fleet dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">{vehicles.length} vehicles in fleet</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8 relative z-10 pb-10">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center card-elevated">
            <p className="text-2xl font-bold text-teal-700">{availableCount}</p>
            <p className="text-xs text-slate-500 mt-1">Available</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center card-elevated">
            <p className="text-2xl font-bold text-blue-600">{rentedCount}</p>
            <p className="text-xs text-slate-500 mt-1">Rented</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center card-elevated">
            <p className="text-2xl font-bold text-amber-600">{inspectingCount}</p>
            <p className="text-xs text-slate-500 mt-1">Inspecting</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 card-elevated p-5 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(formatReg(e.target.value))}
            maxLength={10}
            placeholder="Search by registration"
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 mb-3"
          />
          <div className="grid grid-cols-4 gap-2">
            {['all', 'Available', 'Rented', 'Under Inspection'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                  filter === s
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}>
                {s === 'all' ? 'All' : s === 'Under Inspection' ? 'Inspecting' : s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-400 text-sm">Loading fleet...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-400 text-sm">No vehicles found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(v => (
              <div key={v.id}
                onClick={() => router.push(`/fleet/${v.id}`)}
                className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-slate-400 transition-all card-elevated">
                <div>
                  <p className="text-sm font-semibold text-slate-900 font-mono tracking-wide">{v.registration_number}</p>
                  <p className="text-xs text-slate-500 mt-1">{v.make} {v.model} · {v.year}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyle(v.current_status)}`}>
                  {v.current_status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}