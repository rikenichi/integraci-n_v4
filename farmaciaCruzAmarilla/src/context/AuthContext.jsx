import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { login as apiLogin, logout as apiLogout, obtenerPerfil, tokenStorage } from '../services/medistockApi'

const AuthContext = createContext(null)

function normalizar(perfilResp) {
  const data = perfilResp?.data ?? perfilResp
  const datos = data?.datos || {}
  const usuario = datos.usuario || datos
  return {
    rol_backend: data?.rol || null,
    id: usuario.id || datos.id || null,
    username: usuario.username || datos.username || '',
    nombre: `${usuario.first_name || ''} ${usuario.last_name || ''}`.trim() || usuario.username,
    email: usuario.email || '',
    tipo_cliente: datos.tipo_cliente || null,
    es_institucional: data?.rol === 'CLIENTE' && datos.tipo_cliente === 'INSTITUCIONAL',
    institucion_nombre:
      datos.nombre_institucion ||
      datos.institucion?.razon_social ||
      datos.institucion_nombre ||
      null,
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  const refrescarPerfil = useCallback(async () => {
    try {
      const respuesta = await obtenerPerfil()
      const u = normalizar(respuesta)
      setUsuario(u)
      return u
    } catch {
      tokenStorage.clear()
      setUsuario(null)
      return null
    }
  }, [])

  useEffect(() => {
    let activo = true
    const init = async () => {
      if (!tokenStorage.getAccess()) {
        if (activo) setCargando(false)
        return
      }
      await refrescarPerfil()
      if (activo) setCargando(false)
    }
    init()
    return () => {
      activo = false
    }
  }, [refrescarPerfil])

  const iniciarSesion = async (username, password) => {
    tokenStorage.clear()
    setUsuario(null)
    const { data } = await apiLogin(username, password)
    tokenStorage.setTokens(data.access, data.refresh)
    return refrescarPerfil()
  }

  const cerrarSesion = async () => {
    try {
      const refresh = tokenStorage.getRefresh()
      if (refresh) await apiLogout(refresh)
    } catch {
      /* silencioso */
    }
    tokenStorage.clear()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion, refrescarPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
