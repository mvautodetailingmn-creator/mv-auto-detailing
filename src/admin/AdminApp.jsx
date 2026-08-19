import { useAdminAuth } from '../hooks/useAdminAuth'
import Login from './Login'
import Dashboard from './Dashboard'

export default function AdminApp() {
  const { session, loading, signIn, signOut } = useAdminAuth()

  if (loading) {
    return <div className="min-h-screen bg-black" />
  }

  if (!session) {
    return <Login signIn={signIn} />
  }

  return <Dashboard signOut={signOut} />
}
