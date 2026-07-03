import { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../../../state/gameStore';
import { CHAPTERS } from '../../../content/chapters';
import { CctvCam, CctvEvent, CctvSync, fmtOffset, fmtT, toSec } from '../../../engine/cctv/cctv';
import { sClick } from '../../../engine/audio/audio';

/** 결정적 의사난수 (노이즈/스캔라인 배치 고정) */
const pr = (i: number): number => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** 카메라 스틸 — 코드 드로잉 (사전 저작 허구 프레임의 재현) */
function paintStill(cv: HTMLCanvasElement, cam: CctvCam, ev: CctvEvent, corrected: string | null) {
  const g = cv.getContext('2d');
  if (!g) return;
  const W = 320;
  const H = 180;
  g.fillStyle = '#05070c';
  g.fillRect(0, 0, W, H);

  const wall = '#141a28';
  const floor = '#0b0f1a';
  const line = '#232c44';
  const seed = cam.id.charCodeAt(4) * 31 + ev.frame;

  if (cam.id === 'CAM-A') {
    // 대합실 — 개찰구 3기 + 기둥
    g.fillStyle = wall;
    g.fillRect(0, 0, W, 110);
    g.fillStyle = floor;
    g.fillRect(0, 110, W, 70);
    g.strokeStyle = line;
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      g.moveTo(60 * i + 20, 110);
      g.lineTo(60 * i - 10, 180);
      g.stroke();
    }
    g.fillStyle = '#1c2438';
    for (const x of [70, 140, 210]) {
      g.fillRect(x, 78, 10, 34);
      g.fillRect(x + 34, 78, 10, 34);
      g.fillStyle = '#2a8a4a';
      g.fillRect(x + 3, 82, 4, 3);
      g.fillStyle = '#1c2438';
    }
    g.fillStyle = '#10182b';
    g.fillRect(280, 20, 18, 92); // 기둥
  } else if (cam.id === 'CAM-B') {
    // 동측 통로 — 원근 복도
    g.fillStyle = wall;
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#0a0e18';
    g.beginPath();
    g.moveTo(60, 40);
    g.lineTo(260, 40);
    g.lineTo(320, 180);
    g.lineTo(0, 180);
    g.closePath();
    g.fill();
    g.strokeStyle = line;
    for (let i = 0; i < 4; i++) {
      g.strokeRect(60 + i * 26, 40 + i * 10, 200 - i * 52, 100 - i * 20);
    }
    g.fillStyle = '#f4ecd0';
    for (let i = 0; i < 3; i++) g.fillRect(120 + i * 34, 30 - i * 0, 22, 3); // 천장등
  } else if (cam.id === 'CAM-C') {
    // 2번 승강장 — 스크린도어 + 선로
    g.fillStyle = wall;
    g.fillRect(0, 0, W, 96);
    g.fillStyle = floor;
    g.fillRect(0, 96, W, 84);
    g.fillStyle = '#0a0d16';
    g.fillRect(20, 30, 280, 66); // 유리 너머
    g.strokeStyle = line;
    for (let i = 0; i <= 5; i++) g.strokeRect(20 + i * 56, 30, 2, 66);
    const train = ev.desc.includes('막차');
    if (train) {
      g.fillStyle = '#1a2340';
      g.fillRect(24, 44, 272, 46);
      g.fillStyle = '#e8d9a0';
      for (let i = 0; i < 8; i++) g.fillRect(34 + i * 34, 54, 20, 12);
    }
    g.fillStyle = '#e8b54a';
    for (let x = 0; x < W; x += 14) g.fillRect(x, 100, 8, 3); // 점자블록
  } else {
    // CAM-D 사설 서비스 통로 — 좁은 복도 + 도어
    g.fillStyle = '#0e1220';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#080b14';
    g.beginPath();
    g.moveTo(90, 30);
    g.lineTo(230, 30);
    g.lineTo(300, 180);
    g.lineTo(20, 180);
    g.closePath();
    g.fill();
    g.strokeStyle = line;
    g.beginPath();
    g.moveTo(90, 30);
    g.lineTo(20, 180);
    g.moveTo(230, 30);
    g.lineTo(300, 180);
    g.stroke();
    for (let i = 0; i < 3; i++) {
      g.strokeStyle = '#1a2236';
      g.strokeRect(0, 20 + i * 10, W, 1); // 배관
    }
    const open = ev.tag === 'door';
    g.fillStyle = open ? '#20304e' : '#141c30';
    g.fillRect(196, 52, 34, 74); // 도어
    if (open) {
      g.fillStyle = '#0a0e18';
      g.fillRect(202, 56, 24, 66);
    }
    g.fillStyle = open ? '#7ee0c8' : '#e0637a';
    g.fillRect(232, 84, 3, 3); // 도어 컨트롤러 LED
  }

  // 인물 실루엣 (대상/진입 이벤트)
  const fig = (x: number, y: number, s = 1) => {
    g.fillStyle = '#02040a';
    g.fillRect(x, y, 8 * s, 22 * s);
    g.beginPath();
    g.arc(x + 4 * s, y - 3 * s, 4 * s, 0, Math.PI * 2);
    g.fill();
  };
  if (ev.tag === 'yuna') {
    fig(cam.id === 'CAM-C' ? 150 : 120, cam.id === 'CAM-C' ? 108 : 96);
    g.fillStyle = '#e8b54a';
    g.fillRect(cam.id === 'CAM-C' ? 150 : 120, cam.id === 'CAM-C' ? 100 : 88, 8, 3); // 모자
  }
  if (ev.tag === 'door') {
    fig(150, 100);
    fig(166, 100);
    fig(158, 106, 0.9);
  }
  if (ev.tag === 'resume') {
    // 결손 직후 — 노이즈 버스트
    for (let i = 0; i < 260; i++) {
      g.fillStyle = `rgba(190,205,230,${0.05 + pr(i + seed) * 0.2})`;
      g.fillRect(pr(i * 3.3 + seed) * W, pr(i * 7.7 + seed) * H, 2, 1);
    }
  }
  if (ev.tag === 'anchor' && ev.desc.includes('조명')) {
    g.fillStyle = 'rgba(2,4,8,0.5)';
    g.fillRect(0, 0, W, H); // 순간 감광
  }
  if (ev.tag === 'anchor' && ev.desc.includes('방송')) {
    g.fillStyle = '#f4d88a';
    g.fillRect(6, 8, 10, 6);
    g.strokeStyle = '#f4d88a';
    g.beginPath();
    g.arc(16, 11, 8, -0.6, 0.6);
    g.stroke();
  }

  // 감시 카메라 룩: 노이즈 + 스캔라인 + 비네트 + 타임스탬프
  for (let i = 0; i < 120; i++) {
    g.fillStyle = `rgba(160,180,210,${pr(i + seed) * 0.08})`;
    g.fillRect(pr(i * 1.7 + seed) * W, pr(i * 5.1 + seed) * H, 1, 1);
  }
  g.fillStyle = 'rgba(0,0,0,0.16)';
  for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
  const vg = g.createRadialGradient(W / 2, H / 2, 70, W / 2, H / 2, 210);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = vg;
  g.fillRect(0, 0, W, H);
  g.font = '9px monospace';
  g.fillStyle = '#cfe0f4';
  g.fillText(`${cam.id} ${cam.name}`, 8, 172);
  g.fillText(`LOC ${ev.t}  f${String(ev.frame).padStart(4, '0')}`, 200, 14);
  if (corrected) {
    g.fillStyle = '#7ee0c8';
    g.fillText(`SYNC ${corrected}`, 200, 172);
  }
  g.fillStyle = '#e0637a';
  g.beginPath();
  g.arc(12, 12, 3, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#cfe0f4';
  g.fillText('PLAYBACK', 20, 15);
}

/** CCTV REVIEW — 법원 인가 아카이브의 시각적 열람 (분석·확보는 터미널 cctv 명령) */
export function CctvApp() {
  const chapter = useGame((s) => s.chapter);
  const flags = useGame((s) => s.flags);
  const def = CHAPTERS[chapter].cctv;
  const sync = ((flags[`cctvSync${chapter}`] as CctvSync) ?? {}) as CctvSync;
  const [camId, setCamId] = useState(def?.cams[0]?.id ?? '');
  const [idx, setIdx] = useState(0);
  const cvRef = useRef<HTMLCanvasElement>(null);

  const cam = useMemo(() => def?.cams.find((c) => c.id === camId) ?? def?.cams[0], [def, camId]);
  const ev = cam?.events[Math.min(idx, (cam?.events.length ?? 1) - 1)];

  useEffect(() => {
    if (!cvRef.current || !cam || !ev) return;
    const off = sync[cam.id];
    paintStill(cvRef.current, cam, ev, off != null ? fmtT(toSec(ev.t) - off) : null);
  }, [cam, ev, sync]);

  if (!def || !cam || !ev) return null;
  const off = sync[cam.id];

  return (
    <div className="cctvWrap">
      <div className="cctvCams" role="tablist" aria-label="카메라 선택">
        {def.cams.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={c.id === cam.id}
            className={'cctvCam' + (c.id === cam.id ? ' on' : '')}
            onClick={() => {
              sClick();
              setCamId(c.id);
              setIdx(0);
            }}
          >
            <b>{c.id}</b> {c.name}
            <span className="cctvSyncTag">
              {sync[c.id] != null ? `보정 ${fmtOffset(sync[c.id])}` : '미보정'}
            </span>
          </button>
        ))}
      </div>
      <div className="cctvMain">
        <div className="cctvView">
          <canvas ref={cvRef} width={320} height={180} aria-label={`${cam.id} 스틸 프레임`} />
          <input
            type="range"
            min={0}
            max={cam.events.length - 1}
            value={Math.min(idx, cam.events.length - 1)}
            onChange={(e) => setIdx(Number(e.target.value))}
            aria-label="프레임 이벤트 스크러버"
          />
          <div className="cctvEvent">
            <span className="cctvTime">
              {ev.t}
              {off != null && <em> → {fmtT(toSec(ev.t) - off)}</em>}
            </span>
            {ev.desc}
          </div>
        </div>
        <aside className="cctvMeta">
          <h4>클립 메타</h4>
          <dl>
            <dt>코덱</dt>
            <dd>{cam.meta.codec}</dd>
            <dt>기록 구간</dt>
            <dd>{cam.meta.window}</dd>
            <dt>프레임</dt>
            <dd>
              {cam.meta.frames} / {cam.meta.expected}
              {cam.meta.frames < cam.meta.expected && <b className="cctvWarn"> ⚠ 결손</b>}
            </dd>
            <dt>최종 기록</dt>
            <dd className={cam.meta.editor !== '(원본)' ? 'cctvWarn' : undefined}>
              {cam.meta.editor}
            </dd>
          </dl>
          <p className="cctvNote">
            분석·단서 확보는 터미널의 <code>cctv</code> 명령으로 수행한다.
            <br />
            (sync · gaps · meta · badge · route)
          </p>
        </aside>
      </div>
    </div>
  );
}
