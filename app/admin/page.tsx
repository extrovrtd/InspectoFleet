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

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => activeForm === 'none' ? router.push('/dashboard') : setActiveForm('none')}
              className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
            <h1 className="text-lg font-bold text-gray-900">Admin panel</h1>
          </div>

          {activeForm === 'none' && (
            <div className="space-y-3">
              <button onClick={() => setActiveForm('vehicle')}
                className="w-full bg-teal-600 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-teal-700 text-left">
                + Add new vehicle
              </button>
              <button onClick={() => setActiveForm('staff')}
                className="w-full bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-50 text-left">
                + Create staff account
              </button>
            </div>
          )}

          {activeForm === 'vehicle' && (
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-4">Add new vehicle</h2>
              <form onSubmit={handleAddVehicle} className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Registration number</label>
                  <input type="text" value={reg} onChange={(e) => {
                    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                    let formatted = raw
                    if (raw.length > 2) formatted = raw.slice(0, 2) + '-' + raw.slice(2)
                    if (raw.length > 6) formatted = raw.slice(0, 2) + '-' + raw.slice(2, 6) + '-' + raw.slice(6, 8)
                    setReg(formatted)
                  }} required maxLength={10} placeholder="e.g. GR-1234-21"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <p className="text-xs text-gray-400 mt-1">Format: GR-1234-21</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Make</label>
                  <input type="text" value={make} onChange={(e) => setMake(e.target.value)} required placeholder="e.g. Toyota"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Model</label>
                  <input type="text" value={model} onChange={(e) => setModel(e.target.value)} required placeholder="e.g. Corolla"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Year</label>
                  <input type="number" value={year} onChange={(e) => setYear(e.target.value)} required placeholder="e.g. 2022" min="2000" max="2030"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                {vehicleError && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-600 text-sm">{vehicleError}</p></div>}
                {vehicleSuccess && <div className="bg-teal-50 border border-teal-200 rounded-lg p-3"><p className="text-teal-700 text-sm">✅ {vehicleSuccess}</p></div>}
                <button type="submit" disabled={vehicleLoading}
                  className="w-full bg-teal-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                  {vehicleLoading ? 'Adding...' : 'Add vehicle'}
                </button>
              </form>
            </div>
          )}

          {activeForm === 'staff' && (
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-4">Create staff account</h2>
              <form onSubmit={handleAddStaff} className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Full name</label>
                  <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} required placeholder="e.g. Kofi Mensah"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email address</label>
                  <input type="email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} required placeholder="e.g. kofi@kalcarrentals.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Role</label>
                  <select value={staffRole} onChange={(e) => setStaffRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="counter_agent">Counter Agent</option>
                    <option value="fleet_manager">Fleet Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Temporary password</label>
                  <input type="password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} required placeholder="Min 6 characters" minLength={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                {staffError && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-600 text-sm">{staffError}</p></div>}
                {staffSuccess && <div className="bg-teal-50 border border-teal-200 rounded-lg p-3"><p className="text-teal-700 text-sm">✅ {staffSuccess}</p></div>}
                <button type="submit" disabled={staffLoading}
                  className="w-full bg-teal-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                  {staffLoading ? 'Creating...' : 'Create staff account'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}