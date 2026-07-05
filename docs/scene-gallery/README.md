# BLACK SIGNAL — 씬 갤러리

게임에 사용되는 **모든 씬 배경은 codex CLI 의 imagegen 으로 생성**했다.
이 폴더의 PNG 는 각 씬을 인게임에서 렌더한 스크린샷(1280×800)이다.

| 씬 파일 | 로케이션 | 등장 |
| --- | --- | --- |
| `apartment.png` | 서준의 아파트 작업실 | 프롤로그·Ch1 |
| `parents.png` | 부모님 집 거실 | Ch2 |
| `soc.png` | 이지스 리스폰스 SOC 상황실 | Ch3 |
| `station.png` | 심야 지하철 승강장 | Ch4~6 |
| `hanseo.png` | 한서 임시 거점 오피스텔 | Ch7~10 (시즌2) |

## 생성 파이프라인 (provenance)

각 씬은 다음 절차로 만들어졌다 — 코드 드로잉이 아니라 codex imagegen 산출물이다:

1. `docs/art-prompts/<scene>.md` — codex 에이전트용 자기완결 생성 지시서(스타일·구도 명세)
2. `codex exec - < docs/art-prompts/<scene>.md` → `assets-src/scenes-raw/<scene>.png` (원본 1280×720)
3. `scripts/downscale.ps1` → `public/scenes/<scene>.png` (게임용 640×360, nearest-neighbor)
4. 인게임에서는 이 배경 위에 코드 이펙트(비·모니터 글로우·플리커 등)만 얹는다
   (움직이는 요소·스프라이트·증거 보드는 전부 코드 드로잉).

즉 **사진/씬 아트 = 100% codex imagegen**. 유일한 비-imagegen 그래픽은
`index.html` 의 파비콘(16×16 인라인 SVG 로고 마크)뿐이며, 이는 씬 아트가 아니다.

모든 장면·인물·기관은 허구이며 실존 대상과 무관하다.
