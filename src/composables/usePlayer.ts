import type { MediaItem } from '../types/'

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import { ApiClient } from '@/api'

import { on, off } from './useEventBus'

const playing = ref(false)
const currentTrack = ref<MediaItem | undefined>(undefined)
const progress = ref(0)
const progressValue = ref({ current: 0, total: 0, percent: 0 })
const showFullPlayer = ref(false)

const handlePlayer = () => {
  showFullPlayer.value = true
}

export function usePlayer() {
  const router = useRouter()

  onMounted(async () => {
    await status()

    on('time-update', async (payload: any) => {
      progress.value = payload.percent
      progressValue.value = payload
    })

    on('track_change', async (_payload: any) => {
      await status()
      playing.value = true
    })
    on('track_start', async (_payload: any) => {
      await status()
      playing.value = true
    })
    on('track_stop', async (_payload: any) => {
      await status()
      playing.value = false
      progress.value = 0
      progressValue.value = { current: 0, total: 0, percent: 0 }
    })
    on('track_pause', async (_payload: any) => {
      await status()
      playing.value = false
    })
    on('track_resume', async (_payload: any) => {
      await status()
      playing.value = true
    })
  })

  onBeforeUnmount(() => {
    off('track_change')
    off('track_start')
    off('track_stop')
    off('track_pause')
    off('track_resume')
    off('time-update')
  })
  // --- Methods ---

  const status = async () => {
    const state = await ApiClient.getStatus()
    if (state) {
      currentTrack.value = state.data.currentItem
      playing.value = state.data.playing
    }
  }

  const playItem = async (item: MediaItem, parentSourceId?: string) => {
    const itemToPlay = { ...item }

    switch (itemToPlay.sourceRef.itemType) {
      case 'album':
        await router.push({ name: 'album', query: { id: item.id } })
        return
      case 'playlist':
        await router.push({ name: 'playlist', query: { id: item.id } })
        return
      case 'show':
        await router.push({ name: 'podcast', query: { id: item.id } })
        return
      case 'podcast':
        await router.push({ name: 'podcast', query: { id: item.id } })
        return
    }

    let res

    if (parentSourceId) {
      res = await ApiClient.play(itemToPlay.id, parentSourceId)
    } else {
      res = await ApiClient.play(itemToPlay.id, item.sourceRef.parentSourceId)
    }

    if (res) {
      currentTrack.value = res.data.track
      playing.value = true
    } else {
      currentTrack.value = itemToPlay
      playing.value = true
    }
  }

  const toggleFavourite = async (item: any) => {
    console.log(item)
  }

  const togglePlay = async () => {
    if (!currentTrack.value) return
    if (playing.value) {
      await ApiClient.pause()
      playing.value = false
    } else {
      await ApiClient.resume()
      playing.value = true
    }
  }

  const next = async () => {
    const track = await ApiClient.next()
    currentTrack.value = track.data.track
    playing.value = track.data.track ? true : false
  }

  const previous = async () => {
    const track = await ApiClient.previous()
    currentTrack.value = track.data.track
    playing.value = track.data.track ? true : false
  }

  const stop = async () => {
    playing.value = false
    progress.value = 0
    currentTrack.value = undefined
    return await ApiClient.stop()
  }

  return {
    // State
    playing,
    currentTrack,
    progress,
    progressValue,
    showFullPlayer,
    isConnected: true,
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
