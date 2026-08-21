'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const ANGLES = ['front', 'rear', 'left', 'right', 'interior'] as const
type Angle = typeof ANGLES[number]
type PhotoState = { path: string; notes: string; saved: boolean }
type ExistingPhoto = {
  angle: string
  storage_path: string
  captured_at: string
  agent_notes: string | null
  url?: string | null
}
type InspectionRecord = {
  status: string
  inspection_type: string
  started_at: string
  completed_at: string | null
  contract_ref: string | null
  vehicles: { registration_number: string } | null
}

export default function InspectionPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const [inspectionData, setInspectionData] = useState<InspectionRecord | null>(null)
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [photos, setPhotos] = useState<Partial<Record<Angle, PhotoState>>>({})
  const [currentAngle, setCurrentAngle] = useState<Angle>('front')
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [completedAt, setCompletedAt] = useState<string | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function loadPhotosWithUrls() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: ph } = await supabase
      .from('evidence_photos')
      .select('angle,storage_path,captured_at,agent_notes')
      .eq('inspection_id', id)
    const withUrls = await Promise.all(
      (ph || []).map(async (photo) => {
        const { data: signed } = await supabase.storage
          .from('evidence-photos')
          .createSignedUrl(photo.storage_path, 3600)
        return { ...photo, url: signed?.signedUrl || null }
      })
    )
    return withUrls as ExistingPhoto[]
  }

  useEffect(() => {
    async function loadInspection() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: insp } = await supabase
        .from('inspection_records')
        .select('status,inspection_type,started_at,completed_at,contract_ref,vehicles(registration_number)')
        .eq('id', id)
        .single()
      const photosWithUrls = await loadPhotosWithUrls()
      setInspectionData(insp as unknown as InspectionRecord)
      setExistingPhotos(photosWithUrls)
      if (insp?.status === 'complete') {
        setCompleted(true)
        setCompletedAt(insp.completed_at as string)
      }
      setLoadingData(false)
    }
    loadInspection()
  }, [id])

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const path = `${id}/${currentAngle}-${Date.now()}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('evidence-photos')
      .upload(path, file, { contentType: file.type })
    if (uploadError) { setError(`Upload failed: ${uploadError.message}`); setUploading(false); return }
    const { error: dbError } = await supabase.from('evidence_photos').insert({
      inspection_id: id,
      angle: currentAngle,
      storage_path: path,
      captured_at: new Date().toISOString()
    })
    if (dbError) { setError(`Could not save photo: ${dbError.message}`); setUploading(false); return }
    setPhotos(prev => ({ ...prev, [currentAngle]: { path, notes: '', saved: false } }))
    setNotes('')
    setUploading(false)
  }

  async function handleSaveAndNext() {
    setSaving(true)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    if (notes.trim()) {
      await supabase.from('evidence_photos')
        .update({ agent_notes: notes })
        .eq('inspection_id', id)
        .eq('angle', currentAngle)
    }
    setPhotos(prev => ({ ...prev, [currentAngle]: { ...prev[currentAngle]!, notes, saved: true } }))
    const nextIndex = ANGLES.indexOf(currentAngle) + 1
    if (nextIndex < ANGLES.length) { setCurrentAngle(ANGLES[nextIndex]); setNotes('') }
    setSaving(false)
  }

  async function handleComplete() {
    setCompleting(true)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('inspection_records')
      .update({ status: 'complete', completed_at: now })
      .eq('id', id)
    if (error) { setError('Could not complete inspection.'); setCompleting(false); return }

    const { data: insp } = await supabase
      .from('inspection_records')
      .select('vehicle_id, inspection_type')
      .eq('id', id)
      .single()
    if (insp) {
      const newVehicleStatus = insp.inspection_type === 'handover' ? 'Rented' : 'Available'
      await supabase.from('vehicles')
        .update({ current_status: newVehicleStatus })
        .eq('id', insp.vehicle_id)
    }

    const photosWithUrls = await loadPhotosWithUrls()
    setExistingPhotos(photosWithUrls)
    setCompletedAt(now)
    setCompleted(true)
  }

  if (loadingData) return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </main>
  )

  if (completed) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
              <h1 className="text-lg font-bold text-gray-900">Inspection evidence</h1>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
              <p className="text-teal-800 font-medium text-sm">✅ Inspection completed and locked</p>
              {inspectionData && (
                <div className="mt-2 space-y-1">
                  <p className="text-teal-700 text-xs capitalize">Type: {inspectionData.inspection_type}</p>
                  <p className="text-teal-700 text-xs">Vehicle: {inspectionData.vehicles?.registration_number}</p>
                  <p className="text-teal-700 text-xs">
                    Completed: {completedAt
                      ? new Date(completedAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })
                      : 'N/A'}
                  </p>
                </div>
              )}
            </div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              Photo evidence ({existingPhotos.length} photos)
            </h2>
            {existingPhotos.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No photos captured for this inspection.</p>
            ) : (
              <div className="space-y-4">
                {existingPhotos.map((photo) => (
                  <div key={photo.angle} className="border border-gray-200 rounded-lg overflow-hidden">
                    {photo.url && (
                      <img src={photo.url} alt={`${photo.angle} view`}
                        className="w-full h-56 object-cover bg-gray-100" />
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">{photo.angle}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(photo.captured_at).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })}
                          </p>
                          {photo.agent_notes && (
                            <p className="text-xs text-amber-700 mt-2 bg-amber-50 px-2 py-1 rounded">
                              Note: {photo.agent_notes}
                            </p>
                          )}
                        </div>
                        <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full font-medium">saved</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => router.push('/dashboard')}
              className="mt-4 w-full bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-teal-700">
              Back to dashboard
            </button>
          </div>
        </div>
      </main>
    )
  }

  const capturedCount = Object.keys(photos).length
  const currentPhoto = photos[currentAngle]

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
          <div className="flex gap-1 mb-6">
            {ANGLES.map((angle) => (
              <button key={angle}
                onClick={() => { setCurrentAngle(angle); setNotes(photos[angle]?.notes || '') }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  currentAngle === angle ? 'bg-teal-600 text-white border-teal-600'
                  : photos[angle] ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'bg-white text-gray-400 border-gray-200'
                }`}>
                {photos[angle] ? '✓' : angle}
              </button>
            ))}
          </div>
          <div className="bg-gray-50 rounded-xl p-5 text-center mb-4 border border-gray-200">
            {currentPhoto ? (
              <div>
                <p className="text-teal-600 text-sm font-medium">✅ Photo captured</p>
                <p className="text-gray-400 text-xs mt-1 capitalize">{currentAngle} angle saved</p>
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
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-full bg-teal-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-teal-700 disabled:opacity-50 mb-3">
            {uploading ? 'Uploading...' : currentPhoto ? 'Retake photo' : 'Take photo'}
          </button>
          {currentPhoto && (
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1 capitalize">
                Damage notes — {currentAngle} (optional)
              </label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe any visible damage..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none h-20" />
              <button onClick={handleSaveAndNext} disabled={saving}
                className="w-full mt-2 bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 disabled:opacity-50">
                {saving ? 'Saving...' : ANGLES.indexOf(currentAngle) < ANGLES.length - 1
                  ? 'Save notes & next angle →' : 'Save notes'}
              </button>
            </div>
          )}
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