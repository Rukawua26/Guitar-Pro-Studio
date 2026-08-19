// Utility to encode Float32Array PCM audio buffer into valid 16-bit WAV Blob for instant download

export function audioBufferToWav(buffer: AudioBuffer, opt?: { float32?: boolean }): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = opt && opt.float32 ? 3 : 1; // 1 = PCM, 3 = IEEE float
  const bitDepth = format === 3 ? 32 : 16;

  let result: Uint8Array;
  if (numChannels === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = encodeMono(buffer.getChannelData(0), bitDepth);
  }

  const dataLength = result.length;
  const bufferArray = new ArrayBuffer(44 + dataLength);
  const view = new DataView(bufferArray);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + dataLength, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, dataLength, true);

  // Write the PCM samples
  const byteView = new Uint8Array(bufferArray, 44);
  byteView.set(result);

  return new Blob([bufferArray], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeMono(channel: Float32Array, bitDepth: number): Uint8Array {
  const bytesPerSample = bitDepth / 8;
  const result = new Uint8Array(channel.length * bytesPerSample);
  const view = new DataView(result.buffer);

  for (let i = 0; i < channel.length; i++) {
    const s = Math.max(-1, Math.min(1, channel[i]));
    if (bitDepth === 16) {
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    } else {
      view.setFloat32(i * 4, s, true);
    }
  }
  return result;
}

function interleave(inputL: Float32Array, inputR: Float32Array): Uint8Array {
  const length = inputL.length + inputR.length;
  const result = new Uint8Array(length * 2);
  const view = new DataView(result.buffer);

  let index = 0;
  let offset = 0;

  while (index < inputL.length) {
    let sL = Math.max(-1, Math.min(1, inputL[index]));
    let sR = Math.max(-1, Math.min(1, inputR[index]));

    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7FFF, true);
    offset += 2;
    view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7FFF, true);
    offset += 2;
    index++;
  }
  return result;
}
