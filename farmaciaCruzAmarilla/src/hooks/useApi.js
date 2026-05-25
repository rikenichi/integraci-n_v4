import { useCallback, useEffect, useState } from 'react'

/**
 * Hook genérico para invocar funciones del cliente API.
 * Devuelve { data, error, cargando, recargar }.
 *
 * @param {Function} fetcher  función async que retorna { data }
 * @param {Array}    deps     dependencias para re-disparar el fetch (default [])
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(true)

  const ejecutar = useCallback(
    async (signal) => {
      setCargando(true)
      setError(null)
      try {
        const respuesta = await fetcher()
        if (signal?.aborted) return
        setData(respuesta?.data ?? respuesta)
      } catch (err) {
        if (signal?.aborted) return
        setError(err)
      } finally {
        if (!signal?.aborted) setCargando(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  )

  useEffect(() => {
    const controller = new AbortController()
    ejecutar(controller.signal)
    return () => controller.abort()
  }, [ejecutar])

  return { data, error, cargando, recargar: ejecutar }
}
