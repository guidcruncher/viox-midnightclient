import { onMounted, ref } from 'vue'

import { ApiClient } from '@/api'

export function useAudioSettings() {
  const volume = ref(75)
  const prevVolume = ref(75)
  const balance = ref(0)
  const preset = ref<string>('flat')
  const presets = ref<string[]>([])
  const eq = ref<any>({})
  const spatial = ref(false)
  const isMuted = ref(false)

  onMounted(async () => {
    const eqStatus = (await ApiClient.getEqLevels()) as { data: any }
    eq.value = eqStatus.data

    const presetResponse = (await ApiClient.getEqPresets()) as { data: any }
    presets.value = presetResponse.data.presets

    const speakers = (await ApiClient.getSpeakers()) as { data: any }
    const client = speakers.data[0]

    volume.value = client.volumePercent
    prevVolume.value = client.volumePercent
    isMuted.value = client.muted
  })

  async function resetSettings() {
    volume.value = 75
    prevVolume.value = 75
    isMuted.value = false
    balance.value = 0
    preset.value = 'flat'
    spatial.value = false
    await ApiClient.setAllSpeakerVolume(volume.value)
    await ApiClient.unmuteAllSpeakers()
  }

  async function updateVolume(v: number) {
    if (v) {
      volume.value = v
      await ApiClient.setAllSpeakerVolume(v)
    }
  }

  async function updateBalance(b: number) {
    balance.value = b
  }

  async function setEqPreset(p: string) {
    preset.value = p
    await ApiClient.setEqPreset(p)
    const eqStatus = (await ApiClient.getEqLevels()) as { data: any }
    eq.value = eqStatus.data
  }

  async function setEqBand(band: string, level: number) {
    eq.value[band] = level
    await ApiClient.setEqBand(band, level)
    const eqStatus = (await ApiClient.getEqLevels()) as { data: any }
    eq.value = eqStatus.data
  }

  async function toggleMute() {
    if (isMuted.value) {
      await ApiClient.unmuteAllSpeakers()
      volume.value = prevVolume.value
      isMuted.value = false
    } else {
      prevVolume.value = volume.value
      await ApiClient.muteAllSpeakers()
      volume.value = 0
      isMuted.value = true
    }
  }

  return {
    volume,
    isMuted,
    balance,
    preset,
    presets,
    eq,
    spatial,
    resetSettings,
    updateVolume,
    setEqPreset,
    setEqBand,
    toggleMute,
    updateBalance,
  }
}
