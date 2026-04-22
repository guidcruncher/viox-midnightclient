import FftBarVisualizer from './FftBarVisualizer.vue'
import FftCircleVisualizer from './FftCircleVisualizer.vue'
import FftFireVisualizer from './FftFireVisualizer.vue'
import FftImageVisualizer from './FftImageVisualizer.vue'
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
  image: FftImageVisualizer,
} as const

export type VisualizerKey = keyof typeof visualizerMap

export const visualizerComponent = (key: VisualizerKey) => {
  return visualizerMap[key] || visualizerMap['bar']
}
