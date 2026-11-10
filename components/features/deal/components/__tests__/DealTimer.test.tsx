import { act, render, screen } from "@testing-library/react";
import DealTimer from "../DealTimer";

describe("DealTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-11-10T20:00:00+09:00"));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("마감까지 남은 시간을 시:분:초로 보여준다", () => {
    render(<DealTimer endTime="2026-11-10T21:30:00+09:00" />);

    expect(screen.getByText("01:30:00")).toBeInTheDocument();
  });

  it("1초가 지나면 남은 시간이 1초 줄어든다", () => {
    render(<DealTimer endTime="2026-11-10T21:30:00+09:00" />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("01:29:59")).toBeInTheDocument();
  });

  it("마감 시간이 지나면 '종료'를 보여준다", () => {
    render(<DealTimer endTime="2026-11-10T19:00:00+09:00" />);

    expect(screen.getByText("종료")).toBeInTheDocument();
  });

  it("할인율을 주면 함께 보여준다", () => {
    render(<DealTimer endTime="2026-11-10T21:30:00+09:00" discountRate={67} />);

    expect(screen.getByText("67%")).toBeInTheDocument();
  });
});
