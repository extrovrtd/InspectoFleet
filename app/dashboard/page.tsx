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

          <div className="mt-8 grid grid-cols-1 gap-3">
            <button
              onClick={() => router.push('/inspections/new')}
              className="w-full bg-teal-600 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-teal-700 text-left">
              + New inspection
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}