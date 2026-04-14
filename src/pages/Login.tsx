import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { Link, useNavigate } from "react-router-dom"

export default function Login() {
  const { login, loginGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await login(email, password)
    if (error) { setError(error.message); setLoading(false); return }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Left panel – hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-white border-r border-gray-200 p-10 flex-shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5"/>
              </svg>
            </div>
            <span className="text-base font-semibold text-gray-900">TaskFlow</span>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-3 leading-snug">
            Kelola pekerjaan<br />dengan lebih baik
          </h2>
          <p className="text-sm text-gray-500 mb-10 leading-relaxed">
            Visualisasikan tugas, pantau progres, dan selesaikan pekerjaan lebih cepat.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-4">
            {[
              { icon: "📋", title: "Kanban Board", desc: "Atur tugas dalam kolom yang fleksibel" },
              { icon: "🔀", title: "Drag & Drop", desc: "Pindahkan task dengan mudah antar kolom" },
              { icon: "🏷️", title: "Prioritas & Deadline", desc: "Tandai urgensi dan batas waktu tiap tugas" },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-lg leading-5">{f.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400">© 2025 TaskFlow</p>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm fade-in">

          {/* Logo (mobile only) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5"/>
              </svg>
            </div>
            <span className="text-base font-semibold text-gray-900">TaskFlow</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Masuk</h1>
            <p className="text-sm text-gray-500 mb-6">Masuk ke akun kamu untuk melanjutkan</p>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-lg mb-4 flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-700">Password</label>
                </div>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Masuk...' : 'Masuk'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">atau</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <button onClick={() => loginGoogle()}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.26 9.77A7.24 7.24 0 0 1 12 4.75c1.73 0 3.3.62 4.53 1.64l3.37-3.37A11.96 11.96 0 0 0 12 .75C7.45.75 3.52 3.52 1.73 7.5l3.53 2.27Z"/>
                <path fill="#34A853" d="M16.04 18.01A7.22 7.22 0 0 1 12 19.25a7.24 7.24 0 0 1-6.72-4.55L1.73 16.97A11.97 11.97 0 0 0 12 23.25c2.97 0 5.73-1.07 7.82-2.84l-3.78-2.4Z"/>
                <path fill="#FBBC04" d="M19.82 20.41A11.96 11.96 0 0 0 23.25 12c0-.75-.07-1.48-.21-2.19H12v4.44h6.34a5.44 5.44 0 0 1-2.3 3.56l3.78 2.6Z"/>
                <path fill="#4285F4" d="M5.28 14.7A7.24 7.24 0 0 1 4.75 12c0-.93.16-1.83.45-2.67L1.73 7.5A11.93 11.93 0 0 0 .75 12c0 1.63.33 3.19.93 4.6l3.6-1.9Z"/>
              </svg>
              Lanjutkan dengan Google
            </button>

            <p className="text-center text-xs text-gray-500 mt-5">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">Daftar gratis</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
