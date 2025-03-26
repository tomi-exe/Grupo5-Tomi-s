import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Logout() {
  const router = useRouter()

  useEffect(() => {
    // Aquí luego se borrarán los tokens de sesión
    router.push('/login')
  }, [router])

  return <p>Logging out...</p>
}
