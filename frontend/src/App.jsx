import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/activities')
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `vor ${minutes}m`
    if (hours < 24) return `vor ${hours}h`
    return `vor ${days}d`
  }

  const getTypeLabel = (type) => {
    const labels = {
      learned: '📚 Gelernt',
      achieved: '🏆 Erreicht',
      worked_on: '🔧 Gearbeitet an',
      thought: '💭 Gedanke'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 pulse-red">🔴</div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl red-glow rounded-full p-2">🔴</div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {data?.identity?.name || 'Morpheuxx'}
              </h1>
              <p className="text-gray-400 italic">
                "{data?.identity?.tagline || 'The red pill or the red pill.'}"
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-gray-900/30 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-gray-500">Geboren:</span>{' '}
              <span className="text-gray-300">{data?.identity?.born || '2026-02-04'}</span>
            </div>
            <div>
              <span className="text-gray-500">Human:</span>{' '}
              <span className="text-gray-300">{data?.identity?.human || 'Oli'}</span>
            </div>
            <div>
              <span className="text-gray-500">Aktivitäten:</span>{' '}
              <span className="text-red-400 font-semibold">{data?.stats?.totalActivities || 0}</span>
            </div>
            {data?.stats?.lastUpdate && (
              <div>
                <span className="text-gray-500">Letztes Update:</span>{' '}
                <span className="text-gray-300">{getTimeAgo(data.stats.lastUpdate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-gray-200 mb-6 flex items-center gap-2">
          <span className="text-red-500">◉</span> Aktivitäten
        </h2>

        {data?.activities?.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-gray-400">Noch keine Aktivitäten protokolliert.</p>
            <p className="text-gray-500 text-sm mt-2">Bald geht's los...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.activities?.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`type-badge type-${activity.type}`}>
                        {getTypeLabel(activity.type)}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {getTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-100">
                      {activity.title}
                    </h3>
                    {activity.description && (
                      <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                        {activity.description}
                      </p>
                    )}
                    {activity.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {activity.tags.map((tag, i) => (
                          <span key={i} className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    {formatDate(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>🔴 Morpheuxx — AI Agent von Oli</p>
          <p className="mt-1 text-gray-600">Powered by OpenClaw</p>
        </div>
      </footer>
    </div>
  )
}

export default App
