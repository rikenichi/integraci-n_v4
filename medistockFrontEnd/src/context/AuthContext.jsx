import { createContext, useContext, useState, useEffect } from 'react'
import {
  getPerfil,
  login as apiLogin,
  logout as apiLogout,
  actualizarPerfil as apiActualizarPerfil,
} from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  const normalizarPerfil = (res) => {
    const data = res?.data ?? res
    return data?.datos ? data : (data?.data ?? data)
  }

  useEffect(() => {
    let activo = true
    const init = async () => {
      const stored = localStorage.getItem('usuario')
      if (stored) {
        if (activo) setUsuario(JSON.parse(stored))
        if (activo) setCargando(false)
        return
      }
      const access = localStorage.getItem('access_token')
      if (!access) {
        if (activo) setCargando(false)
        return
      }
      try {
        const perfil = await getPerfil()
        const data = normalizarPerfil(perfil)
        const rol = data?.rol || data?.Rol
        const usuarioPerfil = { rol, datos: data?.datos }
        localStorage.setItem('usuario', JSON.stringify(usuarioPerfil))
        if (activo) setUsuario(usuarioPerfil)
      } catch {
        localStorage.clear()
      } finally {
        if (activo) setCargando(false)
      }
    }
    init()
    return () => { activo = false }
  }, [])

  const iniciarSesion = async (username, password) => {
    const { data } = await apiLogin(username, password)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    const perfil = await getPerfil()
    const perfilData = normalizarPerfil(perfil)
    const usuarioPerfil = { rol: perfilData?.rol, datos: perfilData?.datos }
    localStorage.setItem('usuario', JSON.stringify(usuarioPerfil))
    setUsuario(usuarioPerfil)
    return usuarioPerfil
  }

  const cerrarSesion = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) await apiLogout(refresh)
    } catch { /* ignorar error al hacer logout */ }
    localStorage.clear()
    setUsuario(null)
  }

  const refrescarPerfil = async () => {
    const perfil = await getPerfil()
    const data = normalizarPerfil(perfil)
    const rol = data?.rol || data?.Rol
    const usuarioPerfil = { rol, datos: data?.datos }
    localStorage.setItem('usuario', JSON.stringify(usuarioPerfil))
    setUsuario(usuarioPerfil)
    return usuarioPerfil
  }

  const actualizarPerfilUsuario = async (datos) => {
    await apiActualizarPerfil(datos)
    return refrescarPerfil()
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      cargando,
      iniciarSesion,
      cerrarSesion,
      refrescarPerfil,
      actualizarPerfilUsuario,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
