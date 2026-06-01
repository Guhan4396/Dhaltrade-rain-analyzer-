"use client"

export default function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
    >
      Retry
    </button>
  )
}
