<template>
  <div ref="containerRef" class="w-full h-full overflow-hidden"></div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { ref, onMounted, onUnmounted } from 'vue'

import { FftClient, type FftFrame } from '@/api/fft-client'

const containerRef = ref<HTMLDivElement | null>(null)
let client: FftClient | null = null

// Three.js Core Variables
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let points: THREE.Points
let geometry: THREE.BufferGeometry
let rafId: number

// Constants for our 3D Grid
const BINS = 64
const ROWS = 20
const totalPoints = BINS * ROWS

const initThree = () => {
  if (!containerRef.value) return

  // 1. Scene Setup
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    75,
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    0.1,
    1000
  )
  camera.position.z = 50
  camera.position.y = 20
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  containerRef.value.appendChild(renderer.domElement)

  // 2. Geometry Creation (BufferGeometry is best for performance)
  geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(totalPoints * 3)
  const colors = new Float32Array(totalPoints * 3)

  for (let i = 0; i < totalPoints; i++) {
    const bin = i % BINS
    const row = Math.floor(i / BINS)

    // Spread points out in 3D space
    positions[i * 3] = (bin - BINS / 2) * 1.5 // X
    positions[i * 3 + 1] = 0 // Y (Height - will be updated)
    positions[i * 3 + 2] = (row - ROWS / 2) * 2 // Z (Depth)

    // Initial Colors (Deep Blue)
    colors[i * 3] = 0.1
    colors[i * 3 + 1] = 0.2
    colors[i * 3 + 2] = 0.5
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  // 3. Material (PointsMaterial uses the GPU to draw "sprites")
  const material = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  })

  points = new THREE.Points(geometry, material)
  scene.add(points)
}

const updateFrame = (frame: FftFrame) => {
  if (!geometry) return

  const positions = geometry.attributes.position.array as Float32Array
  const colors = geometry.attributes.color.array as Float32Array

  // Shift rows back to create a "trailing" effect (Waterfall)
  for (let row = ROWS - 1; row > 0; row--) {
    for (let bin = 0; bin < BINS; bin++) {
      const currentIdx = (row * BINS + bin) * 3
      const prevIdx = ((row - 1) * BINS + bin) * 3

      // Move Y value from previous row to current row
      positions[currentIdx + 1] = positions[prevIdx + 1]

      // Update Colors to fade out as they go back
      const fade = 1 - row / ROWS
      colors[currentIdx] = colors[prevIdx] * fade
      colors[currentIdx + 1] = colors[prevIdx + 1] * fade
      colors[currentIdx + 2] = colors[prevIdx + 2] * fade
    }
  }

  // Set the first row to current FFT data
  for (let bin = 0; bin < BINS; bin++) {
    const intensity = Math.max(0, frame[bin] / 50)
    const idx = bin * 3
    positions[idx + 1] = intensity * 15 // Set Height

    // Set Color based on frequency
    colors[idx] = intensity // Red
    colors[idx + 1] = 0.2 // Green
    colors[idx + 2] = 1.0 - intensity // Blue
  }

  geometry.attributes.position.needsUpdate = true
  geometry.attributes.color.needsUpdate = true
}

const animate = () => {
  rafId = requestAnimationFrame(animate)

  // Slow rotation for a dynamic feel
  if (points) {
    points.rotation.y += 0.001
  }

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

  client = new FftClient({
    onFrame: (frame) => updateFrame(frame),
  })
  client.connect()

  window.addEventListener('resize', handleResize)
  animate()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(rafId)
  client?.disconnect()
  renderer.dispose()
})
</script>
