import { onMounted, onUnmounted, ref } from "vue"

export function useDeviceDetector() {
  const isMobile = ref(false)
  const override = ref<string | undefined>("")

  onMounted(() => {
    override.value = getOverride()
    checkScreen()
    window.addEventListener("resize", checkScreen)
  })

  onUnmounted(() => {
    window.removeEventListener("resize", checkScreen)
  })

  function checkScreen() {
    if (override.value === "mobile") {
      isMobile.value = true
      return
    }

    if (override.value === "desktop") {
      isMobile.value = false
      return
    }

    // Default behavior
    isMobile.value = window.matchMedia("(max-width: 767px)").matches
  }

  function getOverride(): string | undefined {
    const params = new URLSearchParams(window.location.search)
    const ui = params.get("ui")

    if (ui === "mobile") return "mobile"
    if (ui === "desktop") return "desktop"
    return undefined
  }

  return {
    isMobile,
    override,
  }
}
