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


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>)=> {
    e.preventDefault()
    setError('')
    setLoading(true)


    const {error} = await login(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    navigate('/')
  }

  const handleGoogleLogin = async () => {
    await loginGoogle()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary  ">
      <div className=" w-full max-w-sm bg-white bordere border-gray-200 rounded-2xl p-8 shadow-sm">
        {/* Logo */}
        <div className="mb-6">
          <span className="text-xl font-semibold text-gray-700">Task</span>
          <span className="text-xl font-semibold text-primary">Flow</span>
        </div>

        <h1 className="text-xl font-medium text-gray-700 mb-1">Selamat Datang</h1>
         <p className="text-sm text-gray-500 mb-6">Masuk ke akun kamu untuk melanjutkan</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label htmlFor="" className="text-xs text-gray-700 mb-1 block">
              Email
            </label>
            <input type="email" className="w-full p-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" onChange={(e) => setEmail(e.target.value)} />
           
          </div>
          <div>
             <label htmlFor="" className="text-xs text-gray-700 mb-1 block">
              Password
            </label>
            <input type="password" className="w-full p-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-2 rounded-lg text-sm hover:bg-primary focus:outline-none focus:bg-primary">
            {loading ? 'Loading...' : 'Masuk'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200"/>
          <span className="text-sm text-gray-400">atau</span>
          <div  className=" flex-1 h-px bg-gray-200"/>
        </div>

        <button onClick={loginGoogle} className="w-full border border-gray-200 rounded-lg py-2 text-sm text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50">
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M5.26 9.77A7.24 7.24 0 0 1 12 4.75c1.73 0 3.3.62 4.53 1.64l3.37-3.37A11.96 11.96 0 0 0 12 .75C7.45.75 3.52 3.52 1.73 7.5l3.53 2.27Z"/>
            <path fill="#34A853" d="M16.04 18.01A7.22 7.22 0 0 1 12 19.25a7.24 7.24 0 0 1-6.72-4.55L1.73 16.97A11.97 11.97 0 0 0 12 23.25c2.97 0 5.73-1.07 7.82-2.84l-3.78-2.4Z"/>
            <path fill="#FBBC04" d="M19.82 20.41A11.96 11.96 0 0 0 23.25 12c0-.75-.07-1.48-.21-2.19H12v4.44h6.34a5.44 5.44 0 0 1-2.3 3.56l3.78 2.6Z"/>
            <path fill="#4285F4" d="M5.28 14.7A7.24 7.24 0 0 1 4.75 12c0-.93.16-1.83.45-2.67L1.73 7.5A11.93 11.93 0 0 0 .75 12c0 1.63.33 3.19.93 4.6l3.6-1.9Z"/>
          </svg>
          Lanjutkan dengan Google
        </button>

        <p className="text-center text-sm text-gray-700 mt-4">
          Belum punya akun? 
          <Link to="/register" className="text-primary">Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
