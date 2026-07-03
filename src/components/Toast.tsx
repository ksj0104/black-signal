import { useGame } from '../state/gameStore';

export function Toast() {
  const toast = useGame((s) => s.toast);
  if (!toast) return null;
  return (
    <div id="toast" className="on" role="status">
      {toast}
    </div>
  );
}
