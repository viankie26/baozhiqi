/**
 * Record microphone audio as a 16 kHz mono WAV using the Web Audio API.
 * Returns a complete, decodable WAV blob (works on iOS Safari).
 */

let stream: MediaStream | null = null;
let audioCtx: AudioContext | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let node: ScriptProcessorNode | null = null;
let chunks: Float32Array[] = [];

export async function startRecording(): Promise<void> {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
  });
  audioCtx = new AudioContext();
  source = audioCtx.createMediaStreamSource(stream);
  node = audioCtx.createScriptProcessor(4096, 1, 1);
  chunks = [];
  node.onaudioprocess = (e) => {
    chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };
  source.connect(node);
  node.connect(audioCtx.destination);
}

export function stopRecording(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      if (!audioCtx) return reject(new Error("not recording"));
      const sr = audioCtx.sampleRate;
      stream?.getTracks().forEach((t) => t.stop());
      node?.disconnect();
      source?.disconnect();
      const blob = encodeWav(chunks, sr);
      audioCtx.close().catch(() => {});
      audioCtx = null;
      if (blob.size < 1024) return reject(new Error("empty"));
      resolve(blob);
    } catch (e) {
      reject(e as Error);
    }
  });
}

function encodeWav(chunks: Float32Array[], sampleRate: number): Blob {
  const target = 16000;
  const ratio = sampleRate / target;
  // Concatenate raw PCM
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const flat = new Float32Array(total);
  let off = 0;
  for (const c of chunks) {
    flat.set(c, off);
    off += c.length;
  }
  // Downsample to 16 kHz
  const outLen = Math.floor(flat.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(flat.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += flat[j] ?? 0;
    out[i] = sum / (end - start);
  }
  const buf = new ArrayBuffer(44 + out.length * 2);
  const view = new DataView(buf);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + out.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, target, true);
  view.setUint32(28, target * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, out.length * 2, true);
  let p = 44;
  for (let i = 0; i < out.length; i++) {
    const s = Math.max(-1, Math.min(1, out[i] ?? 0));
    view.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    p += 2;
  }
  return new Blob([buf], { type: "audio/wav" });
}
