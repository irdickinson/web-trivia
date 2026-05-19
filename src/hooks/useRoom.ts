import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Room } from '../types/game'

interface UseRoomResult {
  room: Room | null
  loading: boolean
  notFound: boolean
}

export function useRoom(code: string | undefined): UseRoomResult {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!code) {
      setLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      doc(db, 'rooms', code),
      (snap) => {
        if (snap.exists()) {
          setRoom(snap.data() as Room)
          setNotFound(false)
        } else {
          setRoom(null)
          setNotFound(true)
        }
        setLoading(false)
      },
      () => {
        setNotFound(true)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [code])

  return { room, loading, notFound }
}
