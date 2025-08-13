import HealthCheck from './components/HealthCheck'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">NotifyMe</h1>
          <p className="text-gray-600">Intelligent email monitoring with WhatsApp notifications</p>
        </header>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">System Status</h2>
            <HealthCheck />
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to NotifyMe</h2>
            <p className="text-gray-600 mb-4">
              Your intelligent email monitoring system is now set up and ready for development.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">Frontend</h3>
                <p className="text-blue-700 text-sm">React + TypeScript + Vite</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">Backend</h3>
                <p className="text-green-700 text-sm">Node.js + Express + TypeScript</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900">Shared</h3>
                <p className="text-purple-700 text-sm">Common types and utilities</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default App
