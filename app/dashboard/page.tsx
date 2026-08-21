'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function DashboardPage() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

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
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </main>
  )

  const roleLabel = role === 'admin' ? 'Administrator'
    : role === 'fleet_manager' ? 'Fleet Manager'
    : 'Counter Agent'

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">InspectoFleet</h1>
              <p className="text-gray-500 mt-1 text-sm">{name}</p>
              <span className="inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full bg-teal-50 text-teal-700">
                {roleLabel}
              </span>
            </div>
            <button onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
              Sign out
            </button>
          </div>

          <div className="space-y-3">
            {/* Counter Agent + Admin */}
            {(role === 'counter_agent' || role === 'admin') && (
              <button onClick={() => router.push('/inspections/new')}
                className="w-full bg-teal-600 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-teal-700 text-left">
                + New inspection
              </button>
            )}

            {/* All roles */}
            <button onClick={() => router.push('/inspections')}
              className="w-full bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-50 text-left">
              🔍 Search inspection history
            </button>

            {/* Fleet Manager + Admin */}
            {(role === 'fleet_manager' || role === 'admin') && (
              <button onClick={() => router.push('/fleet')}
                className="w-full bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-50 text-left">
                🚗 Fleet dashboard
              </button>
            )}

            {/* Admin only */}
            {role === 'admin' && (
              <button onClick={() => router.push('/admin')}
                className="w-full bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-50 text-left">
                ⚙️ Admin panel
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}