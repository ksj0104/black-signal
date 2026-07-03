/**
 * 엔딩 결정 함수 — 결정적 순수 함수 (DESIGN §2 캐논).
 * Ch6 완료 시 스탯 4종 + 추적 플래그로 A/B/C/D 를 우선순위 순서로 판정한다.
 */
import type { Stats } from './types';

export type EndingId = 'A' | 'B' | 'C' | 'D';

export interface DerivedEnding {
  /** 유나 보호 성공 — (ch2 search 또는 ch5 protect) + 경로 재구성 + 목격자 억압 증거 포함 */
  witnessSaved: boolean;
  /** 체인 무결 — 오염 색출 완료 + 무모한 공개 아님 + 패키지에 미검증 증거 없음 */
  evidenceClean: boolean;
  /** 윤가원 협조 증인 — A/D 에서 강윤재 직접 기소 보너스 */
  allyGaShin: boolean;
  /** 무모한 공개 — 오염 3행을 아는 채로 통째 공개 */
  recklessLeak: boolean;
}

export function deriveEnding(flags: Record<string, unknown>): DerivedEnding {
  const recklessLeak = flags.ch4Leak === 'now';
  return {
    recklessLeak,
    witnessSaved:
      (flags.ch2Choice === 'search' || flags.ch5Choice === 'protect') &&
      !!flags.ch5RouteDone &&
      !!flags.ch6WitnessEvidence,
    evidenceClean: !!flags.ch4Verify && !recklessLeak && !!flags.ch6CleanPackage,
    allyGaShin: flags.ch4Witness === 'persuade',
  };
}

/** 첫 만족 엔딩 확정 (우선순위: D → A → B → C) */
export function resolveEnding(stats: Stats, flags: Record<string, unknown>): EndingId {
  const d = deriveEnding(flags);
  if (stats.family >= 55 && stats.integrity >= 60 && d.witnessSaved && !d.recklessLeak) return 'D';
  if (stats.integrity >= 65 && stats.trust >= 60 && d.evidenceClean) return 'A';
  if (stats.nullwave >= 55 && (stats.integrity < 50 || d.recklessLeak)) return 'B';
  return 'C';
}
