// Per-account lifetime stats, stored at stats/{uid}. Guests are never tracked.
export interface PlayerStats {
  uid: string
  displayName: string
  gamesPlayed: number
  wins: number
  totalScore: number
  bestScore: number
  updatedAt: number
  // Identifier of the most recently recorded game, used to make recording
  // idempotent so a refresh on the finished screen can't double-count.
  lastGameKey: string
}
