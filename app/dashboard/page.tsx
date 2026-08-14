'use client'

import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900">InspectoFleet</h1>
          <p className="text-gray-500 mt-1 text-sm">Kal Car Rentals · Vehicle Inspection System</p>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => router.push('/inspections/new')}
              className="w-full bg-teal-600 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-teal-700 text-left">
              + New inspection
            </button>
            <button
              onClick={() => router.push('/inspections')}
              className="w-full bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-50 text-left">
              🔍 Search inspection history
            </button>
            <button
             onClick={() => router.push('/fleet')}
             className="w-full bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-50 text-left">
             🚗 Fleet dashboard
           </button>
          </div>
        </div>
      </div>
    </main>
  )
}