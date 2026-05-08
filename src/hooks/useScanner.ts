'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RepoConnection, ScannerState, ScanProgress, ScanResult } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8080/ws/scan';

const INITIAL_STATE: ScannerState = {
  connected: false,
  progress: null,
  result: null,
  error: null,
};

// ─── Incoming WS message shapes ────────────────────────────────────────────

type WsProgressMsg = { type: 'progress'; payload: ScanProgress };
type WsResultMsg   = { type: 'result';   payload: ScanResult };
type WsErrorMsg    = { type: 'error';    payload: { message: string } };
type WsMessage     = WsProgressMsg | WsResultMsg | WsErrorMsg;

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useScanner() {
  const [state, setState] = useState<ScannerState>(INITIAL_STATE);
  const wsRef = useRef<WebSocket | null>(null);

  /** Merge partial state safely */
  const patch = useCallback((partial: Partial<ScannerState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  /** Tear down existing socket */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onclose = null; // prevent auto-reconnect on manual close
      wsRef.current.close();
      wsRef.current = null;
    }
    patch({ connected: false });
  }, [patch]);

  /** Open socket and begin a scan */
  const startScan = useCallback(
    (connection: RepoConnection) => {
      disconnect();
      setState({ ...INITIAL_STATE });

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        patch({ connected: true });
        ws.send(JSON.stringify({ type: 'scan', payload: connection }));
      };

      ws.onmessage = (event: MessageEvent<string>) => {
        let msg: WsMessage;
        try {
          msg = JSON.parse(event.data) as WsMessage;
        } catch {
          console.error('[useScanner] non-JSON message:', event.data);
          return;
        }

        switch (msg.type) {
          case 'progress':
            patch({ progress: msg.payload });
            break;
          case 'result':
            patch({ result: msg.payload, progress: null });
            break;
          case 'error':
            patch({ error: msg.payload.message });
            break;
        }
      };

      ws.onerror = () => {
        patch({ error: 'WebSocket connection failed. Is the backend running?' });
      };

      ws.onclose = () => {
        patch({ connected: false });
        wsRef.current = null;
      };
    },
    [disconnect, patch],
  );

  /** Reset everything back to idle */
  const reset = useCallback(() => {
    disconnect();
    setState(INITIAL_STATE);
  }, [disconnect]);

  /** Cleanup on unmount */
  useEffect(() => () => disconnect(), [disconnect]);

  return { ...state, startScan, reset, disconnect };
}
