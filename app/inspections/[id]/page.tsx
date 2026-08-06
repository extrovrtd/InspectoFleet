'use client'

import { useParams } from 'next/navigation'

export default function InspectionPage() {
  const params = useParams()
  const id = params?.id as string

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-lg font-bold text-gray-900 mb-2">Inspection started</h1>
        <p className="text-gray-500 text-sm mt-1">Inspection ID: {id}</p>
        <p className="text-gray-400 text-xs mt-4">Photo capture coming in Sprint 3</p>
      </div>
    </main>
  )
}