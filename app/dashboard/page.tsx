export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900">InspectoFleet</h1>
          <p className="text-gray-500 mt-1">Welcome — Sprint 1 in progress</p>
          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-teal-800 font-medium">✅ Login working (US-01)</p>
              <p className="text-teal-600 text-sm mt-1">You are authenticated via Supabase Auth</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 font-medium">⬜ New Inspection (US-02) — Sprint 1 in progress</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 font-medium">⬜ Photo Capture (US-03) — Sprint 1 in progress</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}