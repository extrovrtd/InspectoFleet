'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const ANGLES = ['front', 'rear', 'left', 'right', 'interior'] as const
type Angle = typeof ANGLES[number]

export default function InspectionPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const [photos, setPhotos] = useState<Record<Angle, string | null>>({
    front: null, rear: null, left: null, right: null, interior: null
  })
  const [currentAngle, setCurrentAngle] = useState<Angle>('front')
  const [uploading, setUploading] = useState<Angle | null>(null)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(currentAngle)
    setError('')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const timestamp = new Date().toISOString()
    const path = `${id}/${currentAngle}-${Date.now()}.jpg`

    const { error: uploadError } = await supabase.storage
      .from('evidence-photos')
      .upload(path, file, { contentType: file.type })

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`)
      setUploading(null)
      return
    }

    const { error: dbError } = await supabase
      .from('evidence_photos')
      .insert({
        inspection_id: id,
        angle: currentAngle,
        storage_path: path,
        captured_at: timestamp,
      })

    if (dbError) {
      setError(`Could not save photo record: ${dbError.message}`)
      setUploading(null)
      return
    }

    setPhotos(prev => ({ ...prev, [currentAngle]: path }))
    setUploading(null)

    const nextIndex = ANGLES.indexOf(currentAngle) + 1
    if (nextIndex < ANGLES.length) {
      setCurrentAngle(ANGLES[nextIndex])
    }
  }

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
      setError('Could not complete inspection.')
      setCompleting(false)
    } else {
      setCompleted(true)
      setCompleting(false)
    }
  }

  const capturedCount = Object.values(photos).filter(Boolean).length

  if (completed) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-6">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <p className="text-teal-800 font-medium text-sm">✅ Inspection completed and locked</p>
            <p className="text-teal-600 text-xs mt-1">{capturedCount} photo{capturedCount !== 1 ? 's' : ''} captured as evidence.</p>
          </div>
          <button onClick={() => router.push('/dashboard')}
            className="mt-4 w-full bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-teal-700">
            Back to dashboard
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
            <h1 className="text-lg font-bold text-gray-900">Capture photos</h1>
          </div>

          <p className="text-xs text-gray-400 font-mono mb-4 break-all">{id}</p>

          <div className="flex gap-2 mb-6">
            {ANGLES.map((angle) => (
              <button key={angle} onClick={() => setCurrentAngle(angle)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  currentAngle === angle
                    ? 'bg-teal-600 text-white border-teal-600'
                    : photos[angle]
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-white text-gray-500 border-gray-200'
                }`}>
                {photos[angle] ? '✓' : ''} {angle}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-6 text-center mb-4 border border-gray-200">
            {photos[currentAngle] ? (
              <div>
                <p className="text-teal-600 text-sm font-medium mb-2">✅ Photo captured</p>
                <p className="text-gray-400 text-xs">{currentAngle} angle saved</p>
              </div>
            ) : (
              <div>
                <p className="text-2xl mb-2">📷</p>
                <p className="text-sm font-medium text-gray-700 capitalize">Capture {currentAngle} of vehicle</p>
                <p className="text-xs text-gray-400 mt-1">Photo will be timestamped automatically</p>
              </div>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" capture="environment"
            onChange={handlePhoto} className="hidden" />

          <button onClick={() => fileRef.current?.click()} disabled={!!uploading}
            className="w-full bg-teal-600 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-teal-700 disabled:opacity-50 mb-3">
            {uploading === currentAngle ? 'Uploading...' : photos[currentAngle] ? 'Retake photo' : 'Take photo'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400 mb-2">{capturedCount} of 5 photos captured</p>
            <button onClick={handleComplete} disabled={completing || capturedCount === 0}
              className="w-full border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-40">
              {completing ? 'Completing...' : 'Complete inspection'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}