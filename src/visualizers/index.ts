import FftBarVisualizer from './FftBarVisualizer.vue'
import FftCircleVisualizer from './FftCircleVisualizer.vue'
import FftSpectrogram from './FftSpectrogram.vue'
import FftWaveformVisualizer from './FftWaveformVisualizer.vue'
import FftParticleVisualizer from './FftParticleVisualizer.vue'

const visualizerMap = {
  bar: FftBarVisualizer,
  circle: FftCircleVisualizer,
  waveform: FftWaveformVisualizer,
  spectrogram: FftSpectrogram,
  particles: FftParticleVisualizer,
} as const

export type VisualizerKey = keyof typeof visualizerMap

export const visualizerComponent = (key: VisualizerKey) => {
  return visualizerMap[key] || visualizerMap['bar']
}
