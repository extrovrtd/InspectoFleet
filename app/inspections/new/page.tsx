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

  function formatReg(value: string) {
    const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    let formatted = raw
    if (raw.length > 2) formatted = raw.slice(0, 2) + '-' + raw.slice(2)
    if (raw.length > 6) formatted = raw.slice(0, 2) + '-' + raw.slice(2, 6) + '-' + raw.slice(6, 8)
    return formatted
  }

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

    const { data: inspection, error: iErr } = await supabase
      .from('inspection_records')
      .insert({
        vehicle_id: vehicle.id,
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
    <main className="min-h-screen">
      <div className="brand-header text-white px-6 pt-8 pb-16">
        <div className="max-w-md mx-auto">
          <button onClick={() => router.push('/dashboard')}
            className="text-slate-400 text-xs mb-4 hover:text-white transition-colors">← Dashboard</button>
          <h1 className="text-2xl font-bold">New inspection</h1>
          <p className="text-slate-400 text-sm mt-1">Record vehicle condition with photo evidence</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-8 relative z-10 pb-10">
        <div className="bg-white rounded-xl border border-slate-200 card-elevated p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Vehicle registration
              </label>
              <input
                type="text"
                value={registration}
                onChange={(e) => setRegistration(formatReg(e.target.value))}
                required
                maxLength={10}
                placeholder="GR-2045-21"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono tracking-wide"
              />
              <p className="text-xs text-slate-400 mt-1.5">Vehicle must be registered by an administrator</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Inspection type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setType('handover')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    type === 'handover'
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <p className={`text-sm font-semibold ${type === 'handover' ? 'text-slate-900' : 'text-slate-600'}`}>
                    Handover
                  </p>
                  <p className={`text-xs mt-1 ${type === 'handover' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Customer collecting
                  </p>
                </button>
                <button type="button" onClick={() => setType('return')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    type === 'return'
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <p className={`text-sm font-semibold ${type === 'return' ? 'text-slate-900' : 'text-slate-600'}`}>
                    Return
                  </p>
                  <p className={`text-xs mt-1 ${type === 'return' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Customer returning
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contract reference <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={contractRef}
                onChange={(e) => setContractRef(e.target.value)}
                placeholder="KCR-2026-0412"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-slate-900 text-white rounded-xl px-4 py-3.5 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors">
              {loading ? 'Starting inspection...' : 'Start inspection'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}