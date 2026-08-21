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
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400 text-sm">Loading...</p>
    </main>
  )

  if (completed) {
    return (
      <main className="min-h-screen">
        <div className="brand-header text-white px-6 pt-8 pb-16">
          <div className="max-w-md mx-auto">
            <button onClick={() => router.back()}
              className="text-slate-400 text-xs mb-4 hover:text-white transition-colors">← Back</button>
            <h1 className="text-2xl font-bold">Inspection evidence</h1>
            <p className="text-slate-400 text-sm mt-1">
              {inspectionData?.vehicles?.registration_number} · {inspectionData?.inspection_type}
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 -mt-8 relative z-10 pb-10 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-elevated p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Locked
              </span>
              <span className="text-xs text-slate-500">Record cannot be edited</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle</span>
                <span className="text-slate-900 font-mono">{inspectionData?.vehicles?.registration_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="text-slate-900 capitalize">{inspectionData?.inspection_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Completed</span>
                <span className="text-slate-900">
                  {completedAt
                    ? new Date(completedAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 mb-3">
              Photo evidence ({existingPhotos.length})
            </p>
            {existingPhotos.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                <p className="text-slate-400 text-sm">No photos captured.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {existingPhotos.map((photo) => (
                  <div key={photo.angle} className="bg-white border border-slate-200 rounded-xl overflow-hidden card-elevated">
                    {photo.url && (
                      <img src={photo.url} alt={`${photo.angle} view`}
                        className="w-full h-56 object-cover bg-slate-100" />
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 capitalize">{photo.angle}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(photo.captured_at).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className="text-xs text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                          verified
                        </span>
                      </div>
                      {photo.agent_notes && (
                        <p className="text-xs text-amber-800 mt-3 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                          {photo.agent_notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => router.push('/dashboard')}
            className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-slate-800 transition-colors">
            Back to dashboard
          </button>
        </div>
      </main>
    )
  }

  const capturedCount = Object.keys(photos).length
  const currentPhoto = photos[currentAngle]

  return (
    <main className="min-h-screen">
      <div className="brand-header text-white px-6 pt-8 pb-16">
        <div className="max-w-md mx-auto">
          <button onClick={() => router.push('/dashboard')}
            className="text-slate-400 text-xs mb-4 hover:text-white transition-colors">← Dashboard</button>
          <h1 className="text-2xl font-bold">Capture photos</h1>
          <p className="text-slate-400 text-sm mt-1">
            {inspectionData?.vehicles?.registration_number} · {inspectionData?.inspection_type}
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-8 relative z-10 pb-10">
        <div className="bg-white rounded-xl border border-slate-200 card-elevated p-5">
          <div className="flex gap-1 mb-5">
            {ANGLES.map((angle) => (
              <button key={angle}
                onClick={() => { setCurrentAngle(angle); setNotes(photos[angle]?.notes || '') }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${
                  currentAngle === angle ? 'bg-slate-900 text-white border-slate-900'
                  : photos[angle] ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'bg-white text-slate-400 border-slate-200'
                }`}>
                {photos[angle] ? '✓' : angle}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-6 text-center mb-4 border border-slate-200">
            {currentPhoto ? (
              <div>
                <p className="text-teal-700 text-sm font-semibold">Photo captured</p>
                <p className="text-slate-400 text-xs mt-1 capitalize">{currentAngle} angle saved</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-700 capitalize">Capture {currentAngle}</p>
                <p className="text-xs text-slate-400 mt-1">Timestamped automatically on upload</p>
              </div>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" capture="environment"
            onChange={handlePhoto} className="hidden" />

          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors mb-3">
            {uploading ? 'Uploading...' : currentPhoto ? 'Retake photo' : 'Take photo'}
          </button>

          {currentPhoto && (
            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-600 mb-1.5 capitalize">
                Damage notes — {currentAngle}
              </label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe any visible damage..."
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none h-20" />
              <button onClick={handleSaveAndNext} disabled={saving}
                className="w-full mt-2 bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:border-slate-400 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : ANGLES.indexOf(currentAngle) < ANGLES.length - 1
                  ? 'Save notes & next angle' : 'Save notes'}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400 mb-2">{capturedCount} of 5 photos captured</p>
            <button onClick={handleComplete} disabled={completing || capturedCount === 0}
              className="w-full border border-slate-300 text-slate-700 rounded-xl px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 transition-colors">
              {completing ? 'Completing...' : 'Complete and lock inspection'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}