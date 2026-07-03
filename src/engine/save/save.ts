/** localStorage 기반 저장 (브라우저 로컬 전용, 백엔드 없음) */
const KEY = 'blacksignal.save.v3';

export function saveRaw(json: string): boolean {
  try {
    localStorage.setItem(KEY, json);
    return true;
  } catch {
    return false;
  }
}
export function loadRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
export function wipe(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
