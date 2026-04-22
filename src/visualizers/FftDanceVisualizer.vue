<template>
  <div ref="containerRef" class="w-full h-full bg-slate-950 overflow-hidden">
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center text-white text-xl font-mono bg-black/80 z-10"
    >
      Loading Dancer... {{ progress }}%
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
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

// Animation Specifics
let mixer: THREE.AnimationMixer // Manages skeletal animations
let dancingAction: THREE.AnimationAction
let dancerModel: THREE.Group

// Audio ReactiveState
const currentIntensity = ref(0)

const initThree = () => {
  if (!containerRef.value) return

  clock = new THREE.Clock()
  scene = new THREE.Scene()

  // Fog adds depth and highlights the model
  scene.fog = new THREE.FogExp2(0x020617, 0.05)

  // Camera Setup
  camera = new THREE.PerspectiveCamera(
    75,
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    0.1,
    100
  )
  camera.position.set(0, 1.6, 3) // Eye level
  camera.lookAt(0, 1, 0)

  // Renderer Setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.outputColorSpace = THREE.SRGBColorSpace // Essential for correct colors
  renderer.shadowMap.enabled = true // Enable shadows for realism
  containerRef.value.appendChild(renderer.domElement)

  // Controls (Optional: Allows user to rotate view)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.target.set(0, 1, 0)

  // Lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
  hemiLight.position.set(0, 20, 0)
  scene.add(hemiLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(3, 10, 10)
  dirLight.castShadow = true
  scene.add(dirLight)

  // Ground Plane (To catch shadows)
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0x111111, depthWrite: false })
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.receiveShadow = true
  scene.add(mesh)
}

const loadModel = () => {
  const loader = new GLTFLoader()

  // Replace with the path to your downloaded .glb file
  loader.load(
    '/models/dancing_woman.glb',
    (gltf) => {
      dancerModel = gltf.scene
      dancerModel.scale.set(1, 1, 1) // Adjust scale if needed

      // Enable shadows on all parts of the model
      dancerModel.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          object.castShadow = true
        }
      })

      scene.add(dancerModel)

      // Setup Animation Mixer
      mixer = new THREE.AnimationMixer(dancerModel)

      // Check if animations exist and play the first one (the dance loop)
      if (gltf.animations && gltf.animations.length > 0) {
        dancingAction = mixer.clipAction(gltf.animations[0])
        dancingAction.play()
      } else {
        console.warn('No animations found in GLTF file.')
      }

      loading.value = false
    },
    (xhr) => {
      // Progress tracking
      progress.value = Math.round((xhr.loaded / xhr.total) * 100)
    },
    (error) => {
      console.error('An error happened loading the model', error)
      loading.value = false // Hide loader even on error
    }
  )
}

const updateAudioReaction = (frame: FftFrame) => {
  if (!mixer || !dancingAction || !dancerModel) return

  // 1. Calculate Bass Intensity (Bins 0-5)
  let bassSum = 0
  for (let i = 0; i < 6; i++) {
    bassSum += frame[i]
  }
  const intensity = Math.max(0, Math.min(bassSum / 150, 1.2)) // Normalized 0-1.2
  currentIntensity.value = intensity

  // 2. MODULATE DANCE SPEED
  // Base speed is 1.0. Heavy bass boosts speed up to 1.8. Silence slows it to 0.2.
  const targetSpeed = 0.2 + intensity * 1.3
  // Smoothly interpolate the speed change so it doesn't jerk
  dancingAction.timeScale = THREE.MathUtils.lerp(dancingAction.timeScale, targetSpeed, 0.1)

  // 3. MODULATE GLOW/COLOR (Optional effect)
  dancerModel.traverse((object) => {
    if ((object as THREE.Mesh).isMesh && (object.material as THREE.MeshStandardMaterial).emissive) {
      const mat = object.material as THREE.MeshStandardMaterial
      // Make the model "pulse" red with the bass
      mat.emissive.setRGB(intensity * 0.5, 0, 0)
      mat.emissiveIntensity = intensity * 2
    }
  })
}

const animate = () => {
  rafId = requestAnimationFrame(animate)

  const delta = clock.getDelta() // Time passed since last frame

  // Update skeletal animation
  if (mixer) {
    mixer.update(delta)
  }

  controls.update()
  renderer.render(scene, camera)
}

const handleResize = () => {
  if (!containerRef.value) return
  camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
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

  // Clean up WebGL resources
  if (mixer) mixer.stopAllAction()
  if (renderer) renderer.dispose()
  scene.clear()
})
</script>
