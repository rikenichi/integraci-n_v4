import { createContext, useContext, useState, useEffect } from 'react'
import {
  getPerfil,
  login as apiLogin,
  logout as apiLogout,
  actualizarPerfil as apiActualizarPerfil,
} from '../services/api'

const AuthContext = createContext(null)

function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function extraerGrupos(usuarioData = {}) {
  const grupos = usuarioData.grupos || usuarioData.groups || []
  return grupos
    .map((grupo) => (typeof grupo === 'string' ? grupo : grupo?.name))
    .filter(Boolean)
}

function contieneAlguno(valores, terminos) {
  return valores.some((valor) => {
    const normalizado = normalizarTexto(valor)
    return terminos.some((termino) => normalizado.includes(termino))
  })
}

function resolverRolFrontend(perfil) {
  const rolBackend = String(perfil?.rol || perfil?.Rol || '').toUpperCase()
  const datos = perfil?.datos || {}

  if (rolBackend === 'CLIENTE') {
    const tipoCliente = String(datos.tipo_cliente || '').toUpperCase()
    if (tipoCliente === 'INSTITUCIONAL') return 'cliente_b2b'
    if (tipoCliente === 'PARTICULAR') return 'cliente_b2c'
    return 'cliente'
  }

  const usuarioData = datos.usuario || datos
  const grupos = extraerGrupos(usuarioData)
  const cargo = datos.cargo || ''
  const referencias = [...grupos, cargo]

  if (usuarioData.is_staff || contieneAlguno(referencias, ['admin', 'administrador'])) {
    return 'admin'
  }
  if (contieneAlguno(referencias, ['ejecutivo', 'ventas'])) return 'ejecutivo'
  if (contieneAlguno(referencias, ['operador', 'logistica'])) return 'operador'
  if (contieneAlguno(referencias, ['analista', 'finanzas'])) return 'analista'
  if (rolBackend === 'TRABAJADOR') return 'trabajador'

  return normalizarTexto(rolBackend) || 'usuario'
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  const normalizarPerfil = (res) => {
    const data = res?.data ?? res
    const perfil = data?.datos ? data : (data?.data ?? data)
    const datos = perfil?.datos || {}
    const usuarioData = datos.usuario || datos
    const grupos = extraerGrupos(usuarioData)

    return {
      rol: resolverRolFrontend(perfil),
      rol_backend: perfil?.rol || perfil?.Rol || null,
      datos,
      id: usuarioData.id || datos.id || null,
      username: usuarioData.username || datos.username || datos.email || '',
      email: usuarioData.email || datos.email || '',
      first_name: usuarioData.first_name || datos.first_name || '',
      last_name: usuarioData.last_name || datos.last_name || '',
      rut: datos.rut || usuarioData.rut || '',
      telefono: datos.telefono || usuarioData.telefono || '',
      tipo_cliente: datos.tipo_cliente || null,
      institucion: datos.institucion || null,
      nombre_institucion: datos.nombre_institucion || datos.institucion_nombre || null,
      grupos,
      is_staff: Boolean(usuarioData.is_staff),
    }
  }

  useEffect(() => {
    let activo = true
    const init = async () => {
      const access = localStorage.getItem('access_token')
      if (!access) {
        localStorage.removeItem('usuario')
        localStorage.removeItem('refresh_token')
        if (activo) setCargando(false)
        return
      }
      try {
        const perfil = await getPerfil()
        const usuarioPerfil = normalizarPerfil(perfil)
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
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('usuario')
    setUsuario(null)

    const { data } = await apiLogin(username, password)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    const perfil = await getPerfil()
    const usuarioPerfil = normalizarPerfil(perfil)
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
    const usuarioPerfil = normalizarPerfil(perfil)
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
