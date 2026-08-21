'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

type Inspection = {
  id: string
  inspection_type: string
  status: string
  started_at: string
  completed_at: string | null
  contract_ref: string | null
}

type Vehicle = {
  registration_number: string
  make: string
  model: string
  year: number
  current_status: string
}

export default function VehicleDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: v } = await supabase
        .from('vehicles')
        .select('registration_number, make, model, year, current_status')
        .eq('id', id)
        .single()

      const { data: i } = await supabase
        .from('inspection_records')
        .select('id, inspection_type, status, started_at, completed_at, contract_ref')
        .eq('vehicle_id', id)
        .order('started_at', { ascending: false })

      setVehicle(v)
      setInspections((i || []) as Inspection[])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-400 text-sm text-center">Loading...</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => router.push('/fleet')}
              className="text-gray-400 hover:text-gray-600 text-sm">← Fleet</button>
            <h1 className="text-lg font-bold text-gray-900">Vehicle detail</h1>
          </div>

          {vehicle && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-base font-bold text-gray-900">{vehicle.registration_number}</p>
              <p className="text-sm text-gray-500 mt-0.5">{vehicle.make} {vehicle.model} · {vehicle.year}</p>
              <span className={`mt-2 inline-block text-xs font-medium px-2 py-1 rounded-full ${
                vehicle.current_status === 'Available'
                  ? 'bg-teal-50 text-teal-700'
                  : vehicle.current_status === 'Rented'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>{vehicle.current_status}</span>
            </div>
          )}

          <h2 className="text-sm font-medium text-gray-700 mb-3">Inspection history</h2>

          {inspections.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No inspections recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {inspections.map((insp) => (
                <div key={insp.id}
                  onClick={() => router.push(`/inspections/${insp.id}`)}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{insp.inspection_type}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(insp.started_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      {insp.contract_ref && (
                        <p className="text-xs text-gray-400 mt-0.5">Ref: {insp.contract_ref}</p>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      insp.status === 'complete'
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>{insp.status}</span>
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