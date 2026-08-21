'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function DashboardPage() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ available: 0, rented: 0, inspections: 0 })

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      const { data: vehicles } = await supabase.from('vehicles').select('current_status')
      const { count } = await supabase
        .from('inspection_records')
        .select('*', { count: 'exact', head: true })

      const available = (vehicles || []).filter(v => v.current_status === 'Available').length
      const rented = (vehicles || []).filter(v => v.current_status === 'Rented').length

      setStats({ available, rented, inspections: count || 0 })
      setRole(profile?.role || 'counter_agent')
      setName(profile?.full_name || user.email || '')
      setLoading(false)
    }
    loadProfile()
  }, [router])

  async function handleLogout() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400 text-sm">Loading...</p>
    </main>
  )

  const roleLabel = role === 'admin' ? 'Administrator'
    : role === 'fleet_manager' ? 'Fleet Manager'
    : 'Counter Agent'

  return (
    <main className="min-h-screen">
      <div className="brand-header text-white px-6 pt-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest">Kal Car Rentals</p>
              <h1 className="text-2xl font-bold mt-1">InspectoFleet</h1>
            </div>
            <button onClick={handleLogout}
              className="text-xs text-slate-200 border border-white/20 rounded-lg px-3 py-1.5 hover:bg-white/10 transition-colors">
              Sign out
            </button>
          </div>
          <div className="mt-6">
            <p className="text-white text-sm font-medium">{name}</p>
            <span className="inline-block mt-1.5 text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10">
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center card-elevated">
            <p className="text-2xl font-bold text-teal-700">{stats.available}</p>
            <p className="text-xs text-slate-500 mt-1">Available</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center card-elevated">
            <p className="text-2xl font-bold text-blue-600">{stats.rented}</p>
            <p className="text-xs text-slate-500 mt-1">Rented</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center card-elevated">
            <p className="text-2xl font-bold text-slate-700">{stats.inspections}</p>
            <p className="text-xs text-slate-500 mt-1">Inspections</p>
          </div>
        </div>

        <div className="space-y-2 pb-10">
          {(role === 'counter_agent' || role === 'admin') && (
            <button onClick={() => router.push('/inspections/new')}
              className="w-full bg-slate-900 text-white rounded-xl px-5 py-4 text-left hover:bg-slate-800 transition-colors card-elevated">
              <p className="font-semibold text-sm">New inspection</p>
              <p className="text-slate-400 text-xs mt-0.5">Start a handover or return inspection</p>
            </button>
          )}

          <button onClick={() => router.push('/inspections')}
            className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-left hover:border-slate-300 transition-colors card-elevated">
            <p className="font-semibold text-sm text-slate-900">Inspection history</p>
            <p className="text-slate-500 text-xs mt-0.5">View past inspections and photo evidence</p>
          </button>

          {(role === 'fleet_manager' || role === 'admin') && (
            <button onClick={() => router.push('/fleet')}
              className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-left hover:border-slate-300 transition-colors card-elevated">
              <p className="font-semibold text-sm text-slate-900">Fleet dashboard</p>
              <p className="text-slate-500 text-xs mt-0.5">Monitor vehicle availability and status</p>
            </button>
          )}

          {role === 'admin' && (
            <button onClick={() => router.push('/admin')}
              className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-left hover:border-slate-300 transition-colors card-elevated">
              <p className="font-semibold text-sm text-slate-900">Admin panel</p>
              <p className="text-slate-500 text-xs mt-0.5">Manage vehicles and staff accounts</p>
            </button>
          )}
        </div>
      </div>
    </main>
  )
}