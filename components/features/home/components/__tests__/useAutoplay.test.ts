import { renderHook } from "@testing-library/react";
import { act } from "react";
import useAutoplay from "../useAutoplay";

type Props = { enabled: boolean; onTick: () => void; resetKey?: unknown };

const setup = (initial: Props) =>
  renderHook(
    ({ enabled, onTick, resetKey }: Props) => useAutoplay(enabled, 5000, onTick, resetKey),
    { initialProps: initial },
  );

const advance = (ms: number) =>
  act(() => {
    jest.advanceTimersByTime(ms);
  });

describe("useAutoplay", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("켜져 있으면 intervalMs마다 onTick을 부른다", () => {
    const onTick = jest.fn();
    setup({ enabled: true, onTick });

    advance(4999);
    expect(onTick).not.toHaveBeenCalled();
    advance(1);
    expect(onTick).toHaveBeenCalledTimes(1);
    advance(5000);
    expect(onTick).toHaveBeenCalledTimes(2);
  });

  it("꺼져 있으면 시간이 지나도 onTick을 부르지 않는다", () => {
    const onTick = jest.fn();
    setup({ enabled: false, onTick });

    advance(20000);

    expect(onTick).not.toHaveBeenCalled();
  });

  it("켜졌다가 꺼지면 더 이상 onTick을 부르지 않는다", () => {
    const onTick = jest.fn();
    const { rerender } = setup({ enabled: true, onTick });
    advance(5000);

    rerender({ enabled: false, onTick });
    advance(20000);

    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it("resetKey가 바뀌면 처음부터 다시 센다", () => {
    const onTick = jest.fn();
    const { rerender } = setup({ enabled: true, onTick, resetKey: 0 });
    advance(3000);

    rerender({ enabled: true, onTick, resetKey: 1 });
    advance(3000);
    expect(onTick).not.toHaveBeenCalled();

    advance(2000);
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it("onTick이 바뀌어도 타이머를 다시 만들지 않고 마지막 onTick을 부른다", () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = setup({ enabled: true, onTick: first });
    advance(3000);

    rerender({ enabled: true, onTick: second });
    advance(2000);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("언마운트되면 더 이상 onTick을 부르지 않는다", () => {
    const onTick = jest.fn();
    const { unmount } = setup({ enabled: true, onTick });

    unmount();
    advance(20000);

    expect(onTick).not.toHaveBeenCalled();
  });
});
