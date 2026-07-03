import { useEffect } from 'react';
import { useGame } from '../state/gameStore';
import { MenuScreen } from '../components/MenuScreen';
import { IntroScreen } from '../components/IntroScreen';
import { SceneScreen } from '../components/SceneScreen';
import { Workstation } from '../components/Workstation';
import { EndScreen } from '../components/EndScreen';
import { DialogueOverlay } from '../components/dialogue/DialogueOverlay';
import { SettingsOverlay } from '../components/SettingsOverlay';
import { Toast } from '../components/Toast';
import { rain, setVolume } from '../engine/audio/audio';

export function App() {
  const screen = useGame((s) => s.screen);
  const cfg = useGame((s) => s.cfg);

  // 설정 사이드이펙트: 글자 크기 / 고대비 / 모션 / 오디오
  useEffect(() => {
    document.documentElement.style.setProperty('--fs', cfg.fs + 'px');
    document.body.classList.toggle('hc', cfg.hc);
    document.body.classList.toggle('rm', cfg.rm);
    setVolume(cfg.vol / 100, cfg.amb / 100, cfg.mute);
  }, [cfg]);

  // 아파트 씬에서만 빗소리
  useEffect(() => {
    rain(screen === 'scene' && !cfg.mute);
    return () => rain(false);
  }, [screen, cfg.mute]);

  return (
    <>
      {screen === 'menu' && <MenuScreen />}
      {screen === 'intro' && <IntroScreen />}
      {screen === 'scene' && <SceneScreen />}
      {screen === 'work' && <Workstation />}
      {screen === 'end' && <EndScreen />}
      {/* 워크스테이션에서는 대화가 SIGNAL 메신저로, 알림은 OS 알림 카드로 수신된다 */}
      {screen !== 'work' && <DialogueOverlay />}
      {screen !== 'work' && <Toast />}
      <SettingsOverlay />
      <div className="vig" />
    </>
  );
}
