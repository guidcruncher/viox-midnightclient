import FftBarVisualizer from './FftBarVisualizer.vue'
import FftCircleVisualizer from './FftCircleVisualizer.vue'
import FftSpectrogram from './FftSpectrogram.vue'
import FftWaveformVisualizer from './FftWaveformVisualizer.vue'

const visualizerMap = {
  bar: FftBarVisualizer,
  circle: FftCircleVisualizer,
  waveform: FftWaveformVisualizer,
  spectrogram: FftSpectrogram,
} as const

export type VisualizerKey = keyof typeof visualizerMap

export const visualizerComponent = (selected?: VisualizerKey) => {
  if (!selected) {
    return visualizerMap['bar']
  }
  return visualizerMap[selected]
}
