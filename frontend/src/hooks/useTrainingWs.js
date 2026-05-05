import { useRef, useCallback } from 'react'

const WS_BASE = 'ws://localhost:8000/ws/train'

export function useTrainingWs() {
  const wsRef = useRef(null)

  const connect = useCallback((modelId, samplePaths, epochs, callbacks) => {
    const ws = new WebSocket(`${WS_BASE}/${modelId}`)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ samplePaths, epochs }))
    }

    ws.onmessage = ({ data }) => {
      let evt
      try { evt = JSON.parse(data) } catch { return }
      switch (evt.type) {
        case 'progress':  callbacks.onProgress?.(evt);  break
        case 'completed': callbacks.onCompleted?.(evt); break
        case 'cancelled': callbacks.onCancelled?.(evt); break
        case 'error':     callbacks.onError?.(evt);     break
      }
    }

    ws.onerror = () => callbacks.onError?.({ message: 'Lỗi kết nối WebSocket tới AI Service' })
    ws.onclose = () => console.log('[WS] closed for model:', modelId)
  }, [])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
  }, [])

  return { connect, disconnect }
}
