/** 원본 생성음(WebAudio)만 사용 — 저작권 있는 오디오 없음. 효과음/배경음 채널 분리. */
let AC: AudioContext | null = null;
let fxBus: GainNode | null = null;
let ambBus: GainNode | null = null;
let rainSrc: AudioBufferSourceNode | null = null;
let fxVol = 0.6;
let ambVol = 0.5;
let muted = false;

function ac(): AudioContext | null {
  if (!AC) {
    try {
      AC = new AudioContext();
      fxBus = AC.createGain();
      ambBus = AC.createGain();
      fxBus.connect(AC.destination);
      ambBus.connect(AC.destination);
      applyVol();
    } catch {
      return null;
    }
  }
  return AC;
}
function applyVol() {
  if (fxBus) fxBus.gain.value = muted ? 0 : fxVol * 0.5;
  if (ambBus) ambBus.gain.value = muted ? 0 : ambVol * 0.5;
}
/** 효과음/배경음 볼륨(0~1)과 음소거를 적용 */
export function setVolume(fx: number, amb: number, m: boolean) {
  fxVol = fx;
  ambVol = amb;
  muted = m;
  applyVol();
}
export function beep(f = 520, d = 0.06, type: OscillatorType = 'square', g = 0.12) {
  const c = ac();
  if (!c || !fxBus) return;
  try {
    const o = c.createOscillator();
    const v2 = c.createGain();
    o.type = type;
    o.frequency.value = f;
    v2.gain.setValueAtTime(g, c.currentTime);
    v2.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d);
    o.connect(v2);
    v2.connect(fxBus);
    o.start();
    o.stop(c.currentTime + d);
  } catch {
    /* noop */
  }
}
export const sClick = () => beep(340, 0.04, 'square', 0.06);
export const sErr = () => beep(160, 0.12, 'sawtooth', 0.1);
export const sOk = () => {
  beep(660, 0.07);
  setTimeout(() => beep(880, 0.09), 70);
};
export const sType = () => beep(900, 0.015, 'sine', 0.02);

/** 빗소리 앰비언트 — 배경음 채널로 라우팅 */
export function rain(on: boolean) {
  const c = ac();
  if (!c || !ambBus) return;
  try {
    if (on && !rainSrc) {
      const len = c.sampleRate * 2;
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      rainSrc = c.createBufferSource();
      rainSrc.buffer = buf;
      rainSrc.loop = true;
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 900;
      const g = c.createGain();
      g.gain.value = 0.1;
      rainSrc.connect(f);
      f.connect(g);
      g.connect(ambBus);
      rainSrc.start();
    } else if (!on && rainSrc) {
      rainSrc.stop();
      rainSrc = null;
    }
  } catch {
    /* noop */
  }
}
