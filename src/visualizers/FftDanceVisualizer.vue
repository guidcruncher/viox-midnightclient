<template>
  <div ref="containerRef" class="w-full h-full bg-slate-950 overflow-hidden relative">
    <div
      v-if="loading"
      class="absolute inset-0 flex flex-col items-center justify-center text-white text-xl font-mono bg-black/80 z-10"
    >
      <div class="mb-4">LOADING DANCER</div>
      <div class="w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-orange-500 transition-all duration-300"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ref, onMounted, onUnmounted } from 'vue'

import { FftClient, type FftFrame } from '@/api/fft-client'

const containerRef = ref<HTMLDivElement | null>(null)
const loading = ref(true)
const progress = ref(0)
let client: FftClient | null = null

// Three.js Core
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let clock: THREE.Clock
let rafId: number

// Animation & Model Management
let mixer: THREE.AnimationMixer | null = null
let dancingAction: THREE.AnimationAction | null = null
let dancerModel: THREE.Group | null = null

const initThree = () => {
  if (!containerRef.value) return

  clock = new THREE.Clock()
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x020617, 0.05)

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    0.1,
    100
  )
  camera.position.set(0, 1.6, 3)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  containerRef.value.appendChild(renderer.domElement)

  // Interaction
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.target.set(0, 1, 0)

  // Lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
  scene.add(hemiLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(3, 10, 10)
  dirLight.castShadow = true
  scene.add(dirLight)

  // Floor
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0x050505, depthWrite: false })
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
}

const loadModel = () => {
  const loader = new GLTFLoader()

  // Update path to your local .glb file
  loader.load(
    '/models/dancing_woman.glb',
    (gltf: GLTF) => {
      dancerModel = gltf.scene
      dancerModel.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true
        }
      })
      scene.add(dancerModel)

      // Initialize Animation
      mixer = new THREE.AnimationMixer(dancerModel)
      if (gltf.animations.length > 0) {
        dancingAction = mixer.clipAction(gltf.animations[0])
        dancingAction.play()
      }
      loading.value = false
    },
    (xhr: ProgressEvent) => {
      if (xhr.lengthComputable) {
        progress.value = Math.round((xhr.loaded / xhr.total) * 100)
      }
    },
    (error: unknown) => {
      console.error('GLTF Load Error:', error)
      loading.value = false
    }
  )
}

const updateAudioReaction = (frame: FftFrame) => {
  if (!mixer || !dancingAction || !dancerModel) return

  // Calculate Bass Energy (Low bins)
  let bassSum = 0
  for (let i = 0; i < 6; i++) {
    bassSum += frame[i]
  }
  const intensity = Math.max(0, Math.min(bassSum / 150, 1.2))

  // Modulate Animation Speed (Lerp for smoothness)
  const targetSpeed = 0.4 + intensity * 1.2
  dancingAction.timeScale = THREE.MathUtils.lerp(dancingAction.timeScale, targetSpeed, 0.1)

  // Pulse Emissive Material
  dancerModel.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const mat = object.material as THREE.MeshStandardMaterial
      if (mat && mat.emissive) {
        mat.emissive.setRGB(intensity * 0.4, 0, intensity * 0.1)
        mat.emissiveIntensity = intensity * 3
      }
    }
  })
}

const animate = () => {
  rafId = requestAnimationFrame(animate)
  const delta = clock.getDelta()

  if (mixer) mixer.update(delta)
  if (controls) controls.update()

  renderer.render(scene, camera)
}

const handleResize = () => {
  if (!containerRef.value) return
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

onMounted(() => {
  initThree()
  loadModel()

  client = new FftClient({
    onFrame: (frame) => updateAudioReaction(frame),
  })
  client.connect()

  window.addEventListener('resize', handleResize)
  animate()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(rafId)
  client?.disconnect()

  if (mixer) mixer.stopAllAction()
  renderer?.dispose()
  scene?.clear()
})
</script>
