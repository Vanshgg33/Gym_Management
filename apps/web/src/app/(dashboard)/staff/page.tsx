'use client'

export default function StaffPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Staff &amp; Operations</h1>
        <button className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors">
          + Add Staff
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium mb-1">Total Staff</p>
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-400 mt-0.5">active employees</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-gray-200 bg-white">
        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
          <span className="text-orange-500 text-xl">👥</span>
        </div>
        <p className="font-semibold text-gray-700">Coming soon</p>
        <p className="text-sm text-gray-400 mt-1">Staff management will be available in a future update.</p>
      </div>
    </div>
  )
}
