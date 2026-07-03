import { useEffect, useRef, useState } from 'react';
import { INTRO } from '../content/intro';
import { useGame } from '../state/gameStore';
import { sClick, sType } from '../engine/audio/audio';

export function IntroScreen() {
  const setScreen = useGame((s) => s.setScreen);
  const setFlag = useGame((s) => s.setFlag);
  const rm = useGame((s) => s.cfg.rm);
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const slide = INTRO[idx];

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    const reduced = rm || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setShown(slide.x);
      return;
    }
    setShown('');
    let i = 0;
    timer.current = setInterval(() => {
      i++;
      setShown(slide.x.slice(0, i));
      if (i % 3 === 0) sType();
      if (i >= slide.x.length && timer.current) clearInterval(timer.current);
    }, 26);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [idx, rm, slide.x]);

  const done = () => {
    setFlag('introDone', true);
    setScreen('scene');
  };

  return (
    <section id="intro" className="screen on">
      <div className="introBar top" aria-hidden />
      <div className="introFrame">
        <div className="introMeta">
          <span>PROLOGUE</span>
          <span>
            {String(idx + 1).padStart(2, '0')} / {String(INTRO.length).padStart(2, '0')}
          </span>
        </div>
        <div className="introSlide">
          {slide.t && <span className="introTitle">{slide.t}</span>}
          <span className="introText">{shown}</span>
        </div>
        <div className="introNav">
          <button
            onClick={() => {
              sClick();
              done();
            }}
          >
            건너뛰기
          </button>
          <button
            className="primary"
            onClick={() => {
              sClick();
              if (idx < INTRO.length - 1) setIdx(idx + 1);
              else done();
            }}
          >
            {idx === INTRO.length - 1 ? '시작 ▸' : '다음 ▸'}
          </button>
        </div>
      </div>
      <div className="introBar bottom" aria-hidden />
    </section>
  );
}
