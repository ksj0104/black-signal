/**
 * 표시 이름 치환 — 대화·엔딩의 "서준" 을 플레이어가 고른 이름으로 바꾼다.
 * 콘텐츠 데이터는 캐논 이름("서준")을 유지하고, 표시 계층에서만 치환한다.
 */
export function withName(text: string, name: string | undefined): string {
  const n = (name ?? '').trim();
  if (!n || n === '서준') return text;
  return text.split('서준').join(n);
}

/** 설정 입력값 정제 — 마크업 문자를 제거하고 길이를 제한 */
export function sanitizeName(raw: string): string {
  return raw.replace(/[<>&"'`]/g, '').slice(0, 10);
}
