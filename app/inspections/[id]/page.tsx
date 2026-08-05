export default function InspectionPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-lg font-bold text-gray-900 mb-2">Inspection started</h1>
        <p className="text-gray-500 text-sm">Inspection ID: {params.id}</p>
        <div className="mt-4 bg-teal-50 border border-teal-200 rounded-lg p-4">
          <p className="text-teal-800 font-medium text-sm">✅ Inspection record created (US-02)</p>
          <p className="text-teal-600 text-xs mt-1">Photo capture coming in Sprint 3</p>
        </div>
      </div>
    </main>
  )
}