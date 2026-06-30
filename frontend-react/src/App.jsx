import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import { useSettingsStore } from './store/settingsStore'

function App() {
  const { fetchPublicSettings } = useSettingsStore()

  useEffect(() => {
    fetchPublicSettings()
  }, [fetchPublicSettings])

  return (
    <AppRoutes />
  )
}

export default App