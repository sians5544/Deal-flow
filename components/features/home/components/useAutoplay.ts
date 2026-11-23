import { useEffect, useEffectEvent } from "react";

// 켜져 있는 동안 intervalMs마다 onTick을 부릅니다.
// Design Ref: §5.3 — embla autoplay 플러그인 대신 직접 만든 훅. 의존성이 없고, 가짜 시간으로 따로 테스트할 수 있습니다.
// resetKey가 바뀌면(사용자가 손으로 넘겨 현재 장이 바뀌면) 타이머를 처음부터 다시 셉니다.
// 그래서 넘기자마자 곧바로 또 넘어가지 않습니다.
const useAutoplay = (
  enabled: boolean,
  intervalMs: number,
  onTick: () => void,
  resetKey?: unknown,
) => {
  // onTick이 렌더마다 새 함수여도 타이머를 다시 만들지 않도록 Effect Event로 감쌉니다.
  // 호출될 때는 항상 마지막 렌더의 onTick이 불립니다.
  const tick = useEffectEvent(onTick);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => tick(), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, resetKey]);
};

export default useAutoplay;
