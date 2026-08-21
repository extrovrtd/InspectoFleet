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
  const [newStatus, setNewStatus] = useState('Available')
  const [reason, setReason] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState('')
  const [updateError, setUpdateError] = useState('')

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
      setVehicle(v as Vehicle)
      setInspections((i || []) as Inspection[])
      setNewStatus((v as Vehicle)?.current_status || 'Available')
      setLoading(false)
    }
    load()
  }, [id])

  async function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) { setUpdateError('Please provide a reason.'); return }
    setUpdating(true)
    setUpdateError('')
    setUpdateSuccess('')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('vehicles')
      .update({ current_status: newStatus })
      .eq('id', id)
    if (error) { setUpdateError(error.message); setUpdating(false); return }
    await supabase.from('status_change_log').insert({
      vehicle_id: id,
      changed_by: user?.id,
      old_status: vehicle?.current_status,
      new_status: newStatus,
      reason_note: reason
    })
    setUpdateSuccess(`Status updated to ${newStatus}`)
    setReason('')
    setUpdating(false)
    setTimeout(() => window.location.reload(), 900)
  }

  const statusStyle = (status: string) => {
    if (status === 'Available') return 'bg-teal-50 text-teal-700 border-teal-200'
    if (status === 'Rented') return 'bg-blue-50 text-blue-700 border-blue-200'
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400 text-sm">Loading...</p>
    </main>
  )

  const inputClass = "w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"

  return (
    <main className="min-h-screen">
      <div className="brand-header text-white px-6 pt-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.push('/fleet')}
            className="text-slate-400 text-xs mb-4 hover:text-white transition-colors">← Fleet</button>
          <h1 className="text-2xl font-bold font-mono tracking-wide">{vehicle?.registration_number}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {vehicle?.make} {vehicle?.model} · {vehicle?.year}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8 relative z-10 pb-10 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 card-elevated p-5">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">Current status</p>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyle(vehicle?.current_status || '')}`}>
              {vehicle?.current_status}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 card-elevated p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Update status</h2>
          <form onSubmit={handleStatusUpdate} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">New status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={inputClass}>
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
                <option value="Under Inspection">Under Inspection</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Reason</label>
              <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="Vehicle returned by customer" className={inputClass} />
            </div>
            {updateError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-600 text-sm">{updateError}</p>
              </div>
            )}
            {updateSuccess && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
                <p className="text-teal-700 text-sm">{updateSuccess}</p>
              </div>
            )}
            <button type="submit" disabled={updating}
              className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors">
              {updating ? 'Updating...' : 'Update status'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 card-elevated p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            Inspection history ({inspections.length})
          </h2>
          {inspections.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No inspections recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {inspections.map((insp) => (
                <div key={insp.id}
                  onClick={() => router.push(`/inspections/${insp.id}`)}
                  className="border border-slate-200 rounded-lg p-4 cursor-pointer hover:border-slate-400 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize border ${
                        insp.inspection_type === 'handover'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>{insp.inspection_type}</span>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(insp.started_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                      insp.status === 'complete'
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
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