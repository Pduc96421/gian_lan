import { useRef, useCallback } from 'react'

const WS_BASE = 'ws://localhost:8000/ws/monitor'

export function useMonitorWs() {
  const wsRef = useRef(null)

  const connect = useCallback((cameraCaThiId, modelId, modelPath, callbacks) => {
    const encodedPath = encodeURIComponent(modelPath || '')
    const ws = new WebSocket(`${WS_BASE}/${cameraCaThiId}/${modelId}?path=${encodedPath}`)
    wsRef.current = ws

    ws.onopen = () => {
      callbacks.onOpen?.()
    }

    ws.onmessage = ({ data }) => {
      let evt
      try { evt = JSON.parse(data) } catch { return }
      if (evt.type === 'result') {
        callbacks.onResult?.(evt)
      }
    }

    ws.onerror = () => callbacks.onError?.({ message: 'Lỗi kết nối WebSocket tới AI Service' })
    ws.onclose = () => {
      console.log('[WS] closed for monitor:', cameraCaThiId)
      callbacks.onClose?.()
    }
  }, [])

  const sendFrame = useCallback((frameB64) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ frame: frameB64 }))
    }
  }, [])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
  }, [])

  return { connect, sendFrame, disconnect }
}
