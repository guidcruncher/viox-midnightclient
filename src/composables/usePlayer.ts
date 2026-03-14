import { watch, ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import type { MediaItem } from "../types/"
import ApiClient from "../api/index"
import { useEventBus } from "../plugins/eventBus"

const defaultTrack: MediaItem = {
  id: "",
  title: "Select a Track",
  subtitle: "",
  artist: "",
  type: "local",
  img: "",
  uri: "",
}

// Global state maintained outside the function to persist across component navigation
const backend = ref("")
const playing = ref(false)
const currentTrack = ref<MediaItem>({
  id: "",
  title: "Select a Track",
  subtitle: "",
  artist: "",
  type: "local",
  img: "",
  uri: "",
  duration: undefined,
})
const progress = ref(0)
const showFullPlayer = ref(false)

const handlePlayer = () => {
  showFullPlayer.value = true
}

export function usePlayer() {
  const router = useRouter()

  const eventBus = useEventBus()
  let interval: ReturnType<typeof setInterval> | undefined

  onMounted(async () => {
    const state = await ApiClient.audio.getStatus()
    if (state) {
      backend.value = state.active
      currentTrack.value = state.currentTrack ?? defaultTrack
      playing.value = state.playing
    }
  })

  const updatStatus = async () => {
    const state = await ApiClient.audio.getStatus()
    if (state) {
      backend.value = state.active
      currentTrack.value = state.currentTrack ?? defaultTrack
      playing.value = state.playing
    }
  }

  // --- Sync UI with WebSocket Events ---
  // This watch reacts to any broadcast from the server (Spotify, MPD, etc.)
  watch(
    () => eventBus.lastEvent,
    async (event) => {
      if (!event) return

      switch (event.type) {
        case "metadata":
          backend.value = event.backend
          break
        case "track_change":
          await updatStatus()
          break
        case "track_start":
          await updatStatus()
          playing.value = true
          progress.value = 0
          backend.value = event.backend
          break
        case "track_stop":
          await updatStatus()
          playing.value = false
          progress.value = 0
          break
        case "track_pause":
          await updatStatus()
          backend.value = event.backend
          playing.value = false
          break
      }
    },
    { deep: true },
  )

  // --- Local Progress Emulation ---
  // We keep this to ensure the UI feels smooth between server updates
  watch(playing, (isNowPlaying) => {
    if (isNowPlaying) {
      if (interval) clearInterval(interval)
      if (currentTrack.value.duration) {
        interval = setInterval(() => {
          // Increment progress slightly every second
          if (progress.value < (currentTrack.value.duration ?? 0)) {
            progress.value += 100 / (currentTrack.value.duration ?? 1)
          }
        }, 1000)
      }
    } else {
      clearInterval(interval)
    }
  })

  // --- Methods ---

  const status = async () => {
    const state = await ApiClient.audio.getStatus()
    return state
  }

  const playItem = async (item: MediaItem, opts?: { podcastId?: string }) => {
    const itemToPlay = { ...item }

    if (item.type == "podcast") {
      router.push({ name: "episodes", params: { id: item.id, uri: item.uri } })
      return
    }

    if (item.format == "spotify" || item.uri.includes("spotify:")) {
      const uriParts = item.uri.split(":")

      if (uriParts[1] == "show") {
        router.push({ name: "shows", params: { id: uriParts[2], uri: item.uri } })
        return
      }

      if (uriParts[1] == "artist") {
        router.push({ name: "artist", params: { id: uriParts[2], uri: item.uri } })
        return
      }
    }

    await ApiClient.audio.play(itemToPlay, opts)
    const state = await ApiClient.audio.getStatus()
    if (state) {
      backend.value = state.active
      currentTrack.value = state.currentTrack ?? defaultTrack
      playing.value = state.playing
    }
  }

  const toggleFavourite = async (item: any) => {
    if (currentTrack.value.id === 0) return
    item = await ApiClient.mediaStorage.toggleFavourite(item)
  }

  const togglePlay = async () => {
    if (currentTrack.value.id === 0) return
    if (playing.value) {
      return await ApiClient.audio.pause()
    } else {
      return await ApiClient.audio.resume()
    }
  }

  const next = async () => await ApiClient.audio.next()

  const previous = async () => await ApiClient.audio.previous()

  const stop = async () => {
    playing.value = false
    progress.value = 0
    currentTrack.value = defaultTrack
    return await ApiClient.audio.stop()
  }

  return {
    // State
    playing,
    backend,
    currentTrack,
    progress,
    showFullPlayer,
    isConnected: eventBus.isConnected,
    // Actions
    playItem,
    toggleFavourite,
    togglePlay,
    next,
    previous,
    stop,
    status,
    handlePlayer,
  }
}
