// Minimal typings for the YouTube IFrame Player API surface we use.
export {}

declare global {
  interface YTPlayerVars {
    playsinline?: number
    controls?: number
    disablekb?: number
    fs?: number
    rel?: number
  }

  interface YTPlayer {
    loadVideoById(opts: { videoId: string; startSeconds?: number }): void
    cueVideoById(opts: { videoId: string; startSeconds?: number }): void
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    seekTo(seconds: number, allowSeekAhead: boolean): void
    mute(): void
    unMute(): void
    setVolume(volume: number): void
    getCurrentTime(): number
    getPlayerState(): number
    getVideoData(): { video_id: string; title: string }
    destroy(): void
  }

  interface YTPlayerOptions {
    height?: string | number
    width?: string | number
    videoId?: string
    playerVars?: YTPlayerVars
    events?: {
      onReady?: (event: { target: YTPlayer }) => void
      onStateChange?: (event: { data: number; target: YTPlayer }) => void
      onError?: (event: { data: number }) => void
    }
  }

  interface YTNamespace {
    Player: new (el: HTMLElement | string, opts: YTPlayerOptions) => YTPlayer
    PlayerState: {
      UNSTARTED: number
      ENDED: number
      PLAYING: number
      PAUSED: number
      BUFFERING: number
      CUED: number
    }
  }

  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}
