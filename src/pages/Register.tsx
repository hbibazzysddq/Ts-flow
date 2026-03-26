import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)


  const handlerRegister = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    setLoading(true)
    const {error} = await register(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    navigate('/login')
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

        <form onSubmit={handlerRegister} className="flex flex-col gap-4">
          <div>
            <label htmlFor="" className="text-xs text-gray-700 mb-1 block">
              Email
            </label>
            <input type="email" placeholder="kamu@email.com" className="w-full p-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" onChange={(e) => setEmail(e.target.value)} />
           
          </div>
          <div>
             <label htmlFor="" className="text-xs text-gray-700 mb-1 block">
              Password
            </label>
            <input type="password" placeholder="min. 6 karakter" className="w-full p-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
             <label htmlFor="" className="text-xs text-gray-700 mb-1 block">
              Konfirmasi Password
            </label>
            <input type="password" placeholder="••••••••" className="w-full p-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-2 rounded-lg text-sm hover:bg-primary focus:outline-none focus:bg-primary">
            {loading ? 'Loading...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-700 mt-4">
          Sudah punya akun? {''}
          <Link to="/login" className="text-primary">Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
