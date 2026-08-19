import { useState } from 'react'

const inputClass =
  'w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-electric/60 focus:bg-white/[0.07]'

export default function Login({ signIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: signInError } = await signIn(email, password)
    setLoading(false)
    if (signInError) setError('Incorrect email or password.')
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 w-full max-w-sm">
        <p className="font-display text-lg text-white mb-1">
          MV <span className="text-electric">Auto Detailing</span>
        </p>
        <h1 className="text-white/60 text-sm mb-6">Admin sign in</h1>

        <div className="space-y-4">
          <input
            type="email"
            required
            autoFocus
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-300/90">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-electric text-black btn-glow hover:brightness-110 transition-all px-6 py-3 font-semibold disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <a href="/" className="block mt-5 text-center text-xs text-white/40 hover:text-white/70">
          ← Back to website
        </a>
      </form>
    </div>
  )
}
