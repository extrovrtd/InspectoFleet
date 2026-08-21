'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [activeForm, setActiveForm] = useState<'none' | 'vehicle' | 'staff'>('none')

  const [reg, setReg] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [vehicleLoading, setVehicleLoading] = useState(false)
  const [vehicleSuccess, setVehicleSuccess] = useState('')
  const [vehicleError, setVehicleError] = useState('')

  const [staffName, setStaffName] = useState('')
  const [staffEmail, setStaffEmail] = useState('')
  const [staffRole, setStaffRole] = useState('counter_agent')
  const [staffPassword, setStaffPassword] = useState('')
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffSuccess, setStaffSuccess] = useState('')
  const [staffError, setStaffError] = useState('')

  function formatReg(value: string) {
    const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    let formatted = raw
    if (raw.length > 2) formatted = raw.slice(0, 2) + '-' + raw.slice(2)
    if (raw.length > 6) formatted = raw.slice(0, 2) + '-' + raw.slice(2, 6) + '-' + raw.slice(6, 8)
    return formatted
  }

  async function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault()
    setVehicleLoading(true)
    setVehicleError('')
    setVehicleSuccess('')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.from('vehicles').insert({
      registration_number: reg.toUpperCase(),
      make, model,
      year: parseInt(year),
      current_status: 'Available'
    })
    if (error) { setVehicleError(error.message) }
    else {
      setVehicleSuccess(`Vehicle ${reg.toUpperCase()} added successfully`)
      setReg(''); setMake(''); setModel(''); setYear('')
    }
    setVehicleLoading(false)
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault()
    setStaffLoading(true)
    setStaffError('')
    setStaffSuccess('')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error: authError } = await supabase.auth.signUp({
      email: staffEmail,
      password: staffPassword,
      options: { data: { full_name: staffName } }
    })
    if (authError) { setStaffError(authError.message); setStaffLoading(false); return }
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: staffName,
        role: staffRole,
        is_active: true
      })
      if (profileError) { setStaffError(`Account created but profile failed: ${profileError.message}`) }
      else {
        setStaffSuccess(`Staff account created for ${staffName}`)
        setStaffName(''); setStaffEmail(''); setStaffPassword(''); setStaffRole('counter_agent')
      }
    }
    setStaffLoading(false)
  }

  const inputClass = "w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"

  return (
    <main className="min-h-screen">
      <div className="brand-header text-white px-6 pt-8 pb-16">
        <div className="max-w-md mx-auto">
          <button onClick={() => activeForm === 'none' ? router.push('/dashboard') : setActiveForm('none')}
            className="text-slate-400 text-xs mb-4 hover:text-white transition-colors">
            {activeForm === 'none' ? '← Dashboard' : '← Admin panel'}
          </button>
          <h1 className="text-2xl font-bold">Admin panel</h1>
          <p className="text-slate-400 text-sm mt-1">Manage vehicles and staff accounts</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-8 relative z-10 pb-10">
        <div className="bg-white rounded-xl border border-slate-200 card-elevated p-6">

          {activeForm === 'none' && (
            <div className="space-y-2">
              <button onClick={() => setActiveForm('vehicle')}
                className="w-full bg-slate-900 text-white rounded-xl px-5 py-4 text-left hover:bg-slate-800 transition-colors">
                <p className="font-semibold text-sm">Add new vehicle</p>
                <p className="text-slate-400 text-xs mt-0.5">Register a vehicle to the fleet</p>
              </button>
              <button onClick={() => setActiveForm('staff')}
                className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-left hover:border-slate-400 transition-colors">
                <p className="font-semibold text-sm text-slate-900">Create staff account</p>
                <p className="text-slate-500 text-xs mt-0.5">Add a counter agent, fleet manager or admin</p>
              </button>
            </div>
          )}

          {activeForm === 'vehicle' && (
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Add new vehicle</h2>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Registration number</label>
                <input type="text" value={reg} onChange={(e) => setReg(formatReg(e.target.value))}
                  required maxLength={10} placeholder="GR-2045-21"
                  className={inputClass + " font-mono tracking-wide"} />
                <p className="text-xs text-slate-400 mt-1.5">Format: GR-2045-21</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Make</label>
                <input type="text" value={make} onChange={(e) => setMake(e.target.value)}
                  required placeholder="Toyota" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Model</label>
                <input type="text" value={model} onChange={(e) => setModel(e.target.value)}
                  required placeholder="Corolla" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Year</label>
                <input type="number" value={year} onChange={(e) => setYear(e.target.value)}
                  required placeholder="2022" min="2000" max="2030" className={inputClass} />
              </div>
              {vehicleError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-red-600 text-sm">{vehicleError}</p>
                </div>
              )}
              {vehicleSuccess && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
                  <p className="text-teal-700 text-sm">{vehicleSuccess}</p>
                </div>
              )}
              <button type="submit" disabled={vehicleLoading}
                className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors">
                {vehicleLoading ? 'Adding...' : 'Add vehicle'}
              </button>
            </form>
          )}

          {activeForm === 'staff' && (
            <form onSubmit={handleAddStaff} className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Create staff account</h2>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Full name</label>
                <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)}
                  required placeholder="Kofi Mensah" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email address</label>
                <input type="email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)}
                  required placeholder="kofi@kalcarrentals.com" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Role</label>
                <select value={staffRole} onChange={(e) => setStaffRole(e.target.value)}
                  className={inputClass}>
                  <option value="counter_agent">Counter Agent</option>
                  <option value="fleet_manager">Fleet Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Temporary password</label>
                <input type="password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)}
                  required placeholder="Minimum 6 characters" minLength={6} className={inputClass} />
              </div>
              {staffError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-red-600 text-sm">{staffError}</p>
                </div>
              )}
              {staffSuccess && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
                  <p className="text-teal-700 text-sm">{staffSuccess}</p>
                </div>
              )}
              <button type="submit" disabled={staffLoading}
                className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors">
                {staffLoading ? 'Creating...' : 'Create staff account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}