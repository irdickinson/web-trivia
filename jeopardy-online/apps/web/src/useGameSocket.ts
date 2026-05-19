import { useEffect, useMemo, useRef, useState } from 'react';
import type { ClientEvent, PublicLobbyState, QuestionPackMeta, ServerEvent } from '@jeopardy/shared';

const WS_URL = 'ws://localhost:3001';

export function useGameSocket() {
  const [playerId, setPlayerId] = useState<string>('');
  const [lobby, setLobby] = useState<PublicLobbyState | null>(null);
  const [packs, setPacks] = useState<QuestionPackMeta[]>([]);
  const [error, setError] = useState<string>('');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onmessage = (message) => {
      const event = JSON.parse(message.data) as ServerEvent;
      switch (event.type) {
        case 'connected':
          setPlayerId(event.payload.playerId);
          break;
        case 'availablePacks':
          setPacks(event.payload);
          break;
        case 'lobbyState':
          setLobby(event.payload);
          break;
        case 'error':
          setError(event.payload.message);
          break;
        case 'toast':
          break;
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const send = useMemo(() => (event: ClientEvent) => {
    setError('');
    socketRef.current?.send(JSON.stringify(event));
  }, []);

  return {
    playerId,
    lobby,
    packs,
    error,
    send,
  };
}
