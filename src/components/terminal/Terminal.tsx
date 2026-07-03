import { useEffect, useRef, useState } from 'react';
import { ROOT_FS, useGame } from '../../state/gameStore';
import { CHAPTERS } from '../../content/chapters';
import { autocomplete } from '../../engine/terminal/commands';
import { sClick } from '../../engine/audio/audio';

export function Terminal() {
  const lines = useGame((s) => s.termLines);
  const runCommand = useGame((s) => s.runCommand);
  const termPrint = useGame((s) => s.termPrint);
  const cwd = useGame((s) => s.cwd);
  const chapter = useGame((s) => s.chapter);
  const history = useGame((s) => s.history);
  const [val, setVal] = useState('');
  const [hIdx, setHIdx] = useState<number | null>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const inRef = useRef<HTMLInputElement>(null);

  const caseRoot = CHAPTERS[chapter].root;
  const pathLabel = cwd.replace(caseRoot, '~/case' + String(chapter).padStart(2, '0'));
  const prompt = `joonseo@aegis:${pathLabel}$`;

  // 새 출력마다 하단으로 자동 스크롤 + 입력 포커스 유지
  useEffect(() => {
    outRef.current?.scrollTo({ top: outRef.current.scrollHeight });
  }, [lines]);
  useEffect(() => {
    inRef.current?.focus();
    outRef.current?.scrollTo({ top: outRef.current.scrollHeight });
  }, []);

  const submit = () => {
    const v = val.trim();
    setVal('');
    setHIdx(null);
    if (v) {
      sClick();
      runCommand(v);
    }
  };

  const doComplete = () => {
    const res = autocomplete(val, { vfs: ROOT_FS, cwd, caseRoot });
    if (res.value !== val) setVal(res.value);
    if (res.candidates.length > 1) {
      termPrint(prompt + ' ' + val, 'cmd');
      termPrint(res.candidates.join('   '), 'dim');
    }
  };

  return (
    <div className="pane on" id="paneTerm">
      <div
        id="termOut"
        ref={outRef}
        tabIndex={0}
        aria-label="터미널 출력"
        onClick={() => inRef.current?.focus()}
      >
        {lines.map((l, i) => (
          <div key={i} className={l.cls}>
            {l.text}
          </div>
        ))}
      </div>
      <div id="termLine" onClick={() => inRef.current?.focus()}>
        <span id="prompt">{prompt}</span>
        <input
          ref={inRef}
          type="text"
          value={val}
          spellCheck={false}
          autoComplete="off"
          aria-label="터미널 명령 입력"
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              submit();
            } else if (e.key === 'Tab') {
              e.preventDefault();
              doComplete();
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              if (!history.length) return;
              const next = hIdx === null ? history.length - 1 : Math.max(0, hIdx - 1);
              setHIdx(next);
              setVal(history[next]);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              if (hIdx === null) return;
              const next = hIdx + 1;
              if (next >= history.length) {
                setHIdx(null);
                setVal('');
              } else {
                setHIdx(next);
                setVal(history[next]);
              }
            }
          }}
        />
      </div>
    </div>
  );
}
