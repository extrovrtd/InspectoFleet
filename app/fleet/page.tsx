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

  const filtered = filter === 'all'
    ? vehicles
    : vehicles.filter(v => v.current_status === filter)

  const statusColor = (status: string) => {
    if (status === 'Available') return 'bg-teal-50 text-teal-700'
    if (status === 'Rented') return 'bg-blue-50 text-blue-700'
    return 'bg-amber-50 text-amber-700'
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
            <h1 className="text-lg font-bold text-gray-900">Fleet dashboard</h1>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {['all', 'Available', 'Rented'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                  filter === s
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}>
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center text-gray-400 text-sm py-8">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No vehicles found.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''}</p>
              {filtered.map(v => (
                <div key={v.id} 
                 onClick={() => router.push(`/fleet/${v.id}`)}
                 className="border border-gray-200 rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{v.registration_number}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{v.make} {v.model} · {v.year}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor(v.current_status)}`}>
                    {v.current_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}