import { onMounted, ref } from "vue"
import ApiClient from "../api/index"

export function useAudioSettings() {
  const volume = ref(75)
  const prevVolume = ref(75)
  const balance = ref(0)
  const preset = ref<string>("flat")
  const presets = ref<string[]>([])
  const eq = ref<any>({})
  const spatial = ref(false)
  const isMuted = ref(false)

  onMounted(async () => {
    const eqStatus = (await ApiClient.eq.getStatus()) as { data: any }
    eq.value = eqStatus.data

    const presetResponse = (await ApiClient.eq.getPresets()) as { data: any }
    presets.value = presetResponse.data.presets

    const speakers = (await ApiClient.snapserver.getStatus()) as { data: any }
    const client = speakers.data.server.groups[0].clients[0]

    volume.value = client.config.volume.percent
    prevVolume.value = client.config.volume.percent
    isMuted.value = client.config.volume.muted
  })

  async function resetSettings() {
    volume.value = 75
    prevVolume.value = 75
    isMuted.value = false
    balance.value = 0
    preset.value = "flat"
    spatial.value = false
    await ApiClient.snapserver.setGlobalClientVolume(volume.value)
    await ApiClient.snapserver.unmuteClients()
  }

  async function updateVolume(v: number) {
    volume.value = v
    await ApiClient.snapserver.setGlobalClientVolume(v)
  }

  async function updateBalance(b: number) {
    balance.value = b
  }

  async function setEqPreset(p: string) {
    preset.value = p
    await ApiClient.eq.setPreset(p)
    const eqStatus = (await ApiClient.eq.getStatus()) as { data: any }
    eq.value = eqStatus.data
  }

  async function setEqBand(band: string, level: number) {
    eq.value[band] = level
    await ApiClient.eq.setBand(band, level)
    const eqStatus = (await ApiClient.eq.getStatus()) as { data: any }
    eq.value = eqStatus.data
  }

  async function toggleMute() {
    if (isMuted.value) {
      await ApiClient.snapserver.unmuteClients()
      volume.value = prevVolume.value
      isMuted.value = false
    } else {
      prevVolume.value = volume.value
      await ApiClient.snapserver.muteClients()
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
