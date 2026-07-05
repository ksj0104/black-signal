import { Database } from '../../engine/query/query';

/**
 * Chapter 7 — 한서시장 보궐선거(가상) 공표 개표상황표 + 제보자 제출 수기 검산 적재본
 * (전부 허구 데이터 — 실존 선거·기관·인물과 무관).
 * 쌍둥이 쌍: 제3·11 / 제5·9 / 제8·14 개표구 — 후보별 득표수가 완전히 동일하다.
 * 은닉 모듈 ballast 의 반올림 쿼터가 남긴 버릇이며, 이 시즌 전체를 여는 열쇠다.
 */
export const TWINTALLY_DB: Database = {
  // 공표 개표상황표 — TALLYBRIDGE 디지털 집계 산출본
  official_tally: {
    columns: ['precinct', 'cha_suwan', 'baek_dohyun', 'lim_garyeo', 'total'],
    rows: [
      { precinct: 1, cha_suwan: 12331, baek_dohyun: 13029, lim_garyeo: 2874, total: 28234 },
      { precinct: 2, cha_suwan: 8412, baek_dohyun: 9188, lim_garyeo: 1936, total: 19536 },
      { precinct: 3, cha_suwan: 15207, baek_dohyun: 14892, lim_garyeo: 3181, total: 33280 },
      { precinct: 4, cha_suwan: 14118, baek_dohyun: 14907, lim_garyeo: 3327, total: 32352 },
      { precinct: 5, cha_suwan: 9744, baek_dohyun: 9463, lim_garyeo: 2210, total: 21417 },
      { precinct: 6, cha_suwan: 10442, baek_dohyun: 11215, lim_garyeo: 2483, total: 24140 },
      { precinct: 7, cha_suwan: 7854, baek_dohyun: 8541, lim_garyeo: 1722, total: 18117 },
      { precinct: 8, cha_suwan: 11026, baek_dohyun: 10788, lim_garyeo: 2554, total: 24368 },
      { precinct: 9, cha_suwan: 9744, baek_dohyun: 9463, lim_garyeo: 2210, total: 21417 },
      { precinct: 10, cha_suwan: 13566, baek_dohyun: 14374, lim_garyeo: 3067, total: 31007 },
      { precinct: 11, cha_suwan: 15207, baek_dohyun: 14892, lim_garyeo: 3181, total: 33280 },
      { precinct: 12, cha_suwan: 9218, baek_dohyun: 9925, lim_garyeo: 2144, total: 21287 },
      { precinct: 13, cha_suwan: 11689, baek_dohyun: 12403, lim_garyeo: 2765, total: 26857 },
      { precinct: 14, cha_suwan: 11026, baek_dohyun: 10788, lim_garyeo: 2554, total: 24368 },
    ],
  },
  // 제보자 정다인의 수기 검산표 — 스캔본을 OCR 적재 (제11개표구 표본)
  hand_tally: {
    columns: ['precinct', 'source', 'cha_suwan', 'baek_dohyun', 'lim_garyeo', 'total'],
    rows: [
      {
        precinct: 11,
        source: '정다인 수기 검산(스캔 적재)',
        cha_suwan: 15207,
        baek_dohyun: 14678,
        lim_garyeo: 3395,
        total: 33280,
      },
    ],
  },
  // 개표구별 집계 유닛 배정 — 전 유닛 동일 펌웨어·동일 패치 채널 (E2 복선)
  precinct_meta: {
    columns: ['precinct', 'unit_id', 'firmware', 'patch_channel'],
    rows: Array.from({ length: 14 }, (_, i) => ({
      precinct: i + 1,
      unit_id: `TB-${String(i + 1).padStart(2, '0')}`,
      firmware: '2.1.0-p4',
      patch_channel: 'cert-mirror-2',
    })),
  },
};
