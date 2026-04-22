import FftBarVisualizer from './FftBarVisualizer.vue'
import FftCircleVisualizer from './FftCircleVisualizer.vue'
import FftFireVisualizer from './FftFireVisualizer.vue'
import FftSpectrogram from './FftSpectrogram.vue'
import FftThreeVisualizer from './FftThreeVisualizer.vue'
import FftWaveformVisualizer from './FftWaveformVisualizer.vue'

const visualizerMap = {
  bar: FftBarVisualizer,
  circle: FftCircleVisualizer,
  waveform: FftWaveformVisualizer,
  spectrogram: FftSpectrogram,
  fire: FftFireVisualizer,
  three: FftThreeVisualizer,
} as const

export type VisualizerKey = keyof typeof visualizerMap

export const visualizerComponent = (key: VisualizerKey) => {
  return visualizerMap[key] || visualizerMap['bar']
}
