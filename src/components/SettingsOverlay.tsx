import { useGame } from '../state/gameStore';
import { sClick } from '../engine/audio/audio';
import { sanitizeName } from '../engine/persona';

export function SettingsOverlay() {
  const open = useGame((s) => s.cfgOpen);
  const cfg = useGame((s) => s.cfg);
  const setCfg = useGame((s) => s.setCfg);
  const setCfgOpen = useGame((s) => s.setCfgOpen);
  const wipeSave = useGame((s) => s.wipeSave);
  const saveGame = useGame((s) => s.saveGame);
  if (!open) return null;
  return (
    <div id="cfg" className="on">
      <div id="cfgBox" role="dialog" aria-label="설정">
        <h3>설정</h3>
        <label>
          글자 크기{' '}
          <input
            type="range"
            min={14}
            max={22}
            step={1}
            value={cfg.fs}
            onChange={(e) => setCfg({ fs: +e.target.value })}
          />
        </label>
        <label>
          고대비 모드{' '}
          <input type="checkbox" checked={cfg.hc} onChange={(e) => setCfg({ hc: e.target.checked })} />
        </label>
        <label>
          모션 줄이기{' '}
          <input type="checkbox" checked={cfg.rm} onChange={(e) => setCfg({ rm: e.target.checked })} />
        </label>
        <label>
          효과음{' '}
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={cfg.vol}
            onChange={(e) => setCfg({ vol: +e.target.value })}
          />
        </label>
        <label>
          배경음{' '}
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={cfg.amb}
            onChange={(e) => setCfg({ amb: +e.target.value })}
          />
        </label>
        <label>
          음소거{' '}
          <input
            type="checkbox"
            checked={cfg.mute}
            onChange={(e) => setCfg({ mute: e.target.checked })}
          />
        </label>
        <label>
          표시 이름{' '}
          <input
            type="text"
            value={cfg.name}
            maxLength={10}
            placeholder="서준"
            aria-label="표시 이름 (대화에서 사용)"
            onChange={(e) => setCfg({ name: sanitizeName(e.target.value) })}
            onBlur={(e) => {
              if (!e.target.value.trim()) setCfg({ name: '서준' });
            }}
          />
        </label>
        <label>
          저장 데이터 삭제 <button onClick={wipeSave}>삭제</button>
        </label>
        <div style={{ textAlign: 'right' }}>
          <button
            className="primary"
            onClick={() => {
              sClick();
              setCfgOpen(false);
              saveGame(true);
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
