'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function InspectionPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')

  async function handleComplete() {
    setCompleting(true)
    setError('')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase
      .from('inspection_records')
      .update({ status: 'complete', completed_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      setError('Could not complete inspection. Please try again.')
      setCompleting(false)
    } else {
      setCompleted(true)
      setCompleting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
          <h1 className="text-lg font-bold text-gray-900">Inspection</h1>
        </div>

        <p className="text-sm text-gray-500 mb-1">Inspection ID</p>
        <p className="text-xs font-mono text-gray-700 mb-6 break-all">{id}</p>

        {completed ? (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <p className="text-teal-800 font-medium text-sm">✅ Inspection completed and locked</p>
            <p className="text-teal-600 text-xs mt-1">This record cannot be edited.</p>
            <button onClick={() => router.push('/dashboard')}
              className="mt-4 w-full bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-teal-700">
              Back to dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm font-medium">⚠️ Once completed, this record will be locked and cannot be edited.</p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <button onClick={handleComplete} disabled={completing}
              className="w-full bg-teal-600 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
              {completing ? 'Completing...' : 'Complete and lock inspection'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}