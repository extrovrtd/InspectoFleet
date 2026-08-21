'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [reg, setReg] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase
      .from('vehicles')
      .insert({
        registration_number: reg.toUpperCase(),
        make,
        model,
        year: parseInt(year),
        current_status: 'Available'
      })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(`Vehicle ${reg.toUpperCase()} added successfully`)
      setReg('')
      setMake('')
      setModel('')
      setYear('')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
            <h1 className="text-lg font-bold text-gray-900">Admin panel</h1>
          </div>

          <h2 className="text-sm font-medium text-gray-700 mb-4">Add new vehicle</h2>

          <form onSubmit={handleAddVehicle} className="space-y-3">
           <div>
             <label className="block text-xs text-gray-500 mb-1">Registration number</label>
             <input type="text" value={reg}
             onChange={(e) => {
               const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
               let formatted = raw
               if (raw.length > 2) formatted = raw.slice(0, 2) + '-' + raw.slice(2)
               if (raw.length > 6) formatted = raw.slice(0, 2) + '-' + raw.slice(2, 6) + '-' + raw.slice(6, 8)
               setReg(formatted)
              }}
              required maxLength={10}
              placeholder="e.g. GR-1234-21"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
             <p className="text-xs text-gray-400 mt-1">Format: GR-1234-21</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Make</label>
              <input type="text" value={make} onChange={(e) => setMake(e.target.value)} required
                placeholder="e.g. Toyota"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Model</label>
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} required
                placeholder="e.g. Corolla"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Year</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} required
                placeholder="e.g. 2022" min="2000" max="2030"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-600 text-sm">{error}</p></div>}
            {success && <div className="bg-teal-50 border border-teal-200 rounded-lg p-3"><p className="text-teal-700 text-sm">✅ {success}</p></div>}

            <button type="submit" disabled={loading}
              className="w-full bg-teal-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
              {loading ? 'Adding...' : 'Add vehicle'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}