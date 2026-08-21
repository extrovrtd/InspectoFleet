'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function NewInspectionPage() {
  const [registration, setRegistration] = useState('')
  const [type, setType] = useState<'handover' | 'return'>('handover')
  const [contractRef, setContractRef] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('registration_number', registration.toUpperCase())
      .single()

    if (!vehicle) {
      setError('Vehicle not found. Please ask an administrator to register this vehicle first.')
     setLoading(false)
     return
    }
    const vehicleId = vehicle.id

    const { data: inspection, error: iErr } = await supabase
      .from('inspection_records')
      .insert({
        vehicle_id: vehicleId,
        agent_id: user.id,
        inspection_type: type,
        contract_ref: contractRef || null,
        status: 'open'
      })
      .select('id')
      .single()

    if (iErr) { setError('Could not create inspection. Please try again.'); setLoading(false); return }

    router.push(`/inspections/${inspection.id}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
            <h1 className="text-lg font-bold text-gray-900">New inspection</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle registration
              </label>
              <input
                type="text"
                value={registration}
                onChange={(e) => {
                 const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                 let formatted = raw
                 if (raw.length > 2) formatted = raw.slice(0, 2) + '-' + raw.slice(2)
                 if (raw.length > 6) formatted = raw.slice(0, 2) + '-' + raw.slice(2, 6) + '-' + raw.slice(6, 8)
                 setRegistration(formatted)
                }}
                required maxLength={10}
                placeholder="e.g. GR-2045-21"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspection type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setType('handover')}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    type === 'handover'
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  ↓ Handover
                  <p className="text-xs font-normal mt-0.5">Customer collecting</p>
                </button>
                <button type="button" onClick={() => setType('return')}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    type === 'return'
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  ↑ Return
                  <p className="text-xs font-normal mt-0.5">Customer returning</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract reference <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={contractRef}
                onChange={(e) => setContractRef(e.target.value)}
                placeholder="e.g. KCR-2026-0412"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-teal-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
              {loading ? 'Starting...' : 'Start inspection'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}