import { WAVEFORM_HEIGHTS } from '../data'

export async function analyzeAudioFile(file: File) {
  const url = URL.createObjectURL(file)
  const arrayBuffer = await file.arrayBuffer()
  const audioContext = new AudioContext()

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const channelData = audioBuffer.getChannelData(0)
    const barCount = WAVEFORM_HEIGHTS.length
    const blockSize = Math.max(1, Math.floor(channelData.length / barCount))
    const waveform: number[] = []

    for (let i = 0; i < barCount; i++) {
      let peak = 0
      const start = i * blockSize
      const end = Math.min(start + blockSize, channelData.length)
      for (let j = start; j < end; j++) {
        peak = Math.max(peak, Math.abs(channelData[j]))
      }
      waveform.push(Math.max(4, Math.round(peak * 140)))
    }

    return {
      fileName: file.name,
      url,
      duration: Math.max(1, Math.round(audioBuffer.duration)),
      waveform,
    }
  } finally {
    await audioContext.close()
  }
}
